package com.eip.platform.idempotency;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

import org.springframework.stereotype.Service;

import com.eip.platform.error.IdempotencyKeyReuseException;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Provides at-most-once execution for client operations carrying an idempotency
 * key.
 *
 * <p><strong>First implementation (pragmatic):</strong>
 * <ul>
 *   <li>No prior record: run the action, persist a record (request hash, org,
 *       timestamps, TTL 24h) and return the result.</li>
 *   <li>Existing record with the <em>same</em> request hash: treat as a retry;
 *       re-runs the action and returns its result without re-persisting. A full
 *       implementation would cache and replay the stored response body/status
 *       instead of re-executing the action.</li>
 *   <li>Existing record with a <em>different</em> request hash: reject with
 *       {@link IdempotencyKeyReuseException} (key reused for a different payload).</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private static final int MAX_BODY_LENGTH = 8192;

    private final IdempotencyRepository repository;

    /**
     * Executes {@code action} at most once for the given operation/key pair.
     *
     * @param operation logical operation name (e.g. {@code "createOrder"})
     * @param key       client-supplied idempotency key
     * @param request   the request payload (used to compute a stability hash)
     * @param action    the work to perform
     * @param <T>       result type
     * @return the action result
     * @throws IdempotencyKeyReuseException if the key was already used with a different payload
     */
    public <T> T execute(String operation, String key, Object request, Supplier<T> action) {
        UUID organizationId = OrganizationContextHolder.current().organizationId().value();
        String requestHash = sha256(String.valueOf(request));

        Optional<IdempotencyRecord> existing =
                repository.findByOrganizationIdAndOperationAndIdemKey(organizationId, operation, key);

        if (existing.isPresent()) {
            IdempotencyRecord record = existing.get();
            if (!record.getRequestHash().equals(requestHash)) {
                throw new IdempotencyKeyReuseException(
                        "Chave de idempotencia reutilizada com payload diferente: " + key);
            }
            // TODO: replay the persisted response body/status instead of re-executing.
            log.debug("Retry idempotente detectado para operation={} key={}", operation, key);
            return action.get();
        }

        T result = action.get();
        persist(organizationId, operation, key, requestHash, result);
        return result;
    }

    private <T> void persist(UUID organizationId, String operation, String key,
                             String requestHash, T result) {
        OffsetDateTime now = OffsetDateTime.now();
        IdempotencyRecord record = new IdempotencyRecord();
        record.setId(UUID.randomUUID());
        record.setOrganizationId(organizationId);
        record.setOperation(operation);
        record.setIdemKey(key);
        record.setRequestHash(requestHash);
        record.setResponseStatus(200);
        record.setResponseBody(truncate(String.valueOf(result)));
        record.setCreatedAt(now);
        record.setExpiresAt(now.plusHours(24));
        repository.save(record);
    }

    private static String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() <= MAX_BODY_LENGTH ? value : value.substring(0, MAX_BODY_LENGTH);
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponivel na JVM", ex);
        }
    }
}
