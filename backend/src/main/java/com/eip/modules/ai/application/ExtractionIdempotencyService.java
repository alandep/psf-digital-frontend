package com.eip.modules.ai.application;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.eip.modules.ai.domain.model.AiExecutionPolicy;
import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiPromptSpec;
import com.eip.modules.ai.domain.model.AiRequest;
import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.port.out.AiGatewayPort;
import com.eip.modules.ai.domain.port.out.ExtractionCachePort;

import lombok.RequiredArgsConstructor;

/**
 * Adds idempotency to structured document extraction.
 *
 * <p>The idempotency key is derived from
 * {@code organizationId + documentHash + task + promptVersion + modelVersion}
 * (the document hash is itself a SHA-256 of the request input). On a cache hit
 * the provider (Gemini) is <strong>not</strong> called again — the previously
 * stored {@link AiResult} is returned. Therefore, for a given key, two
 * consecutive extraction calls cause <strong>at most one</strong> provider call,
 * with the second being an equivalent cache hit (Property 4,
 * Requirements 10.1-10.4).
 */
@Service
@RequiredArgsConstructor
public class ExtractionIdempotencyService {

    private final ExtractionCachePort cache;
    private final AiGatewayPort gateway;

    /**
     * Runs an idempotent extraction: returns the cached result for the derived
     * key if present, otherwise calls the provider once and stores the result.
     *
     * @param organizationId the owning tenant
     * @param model          the resolved model route to call on a cache miss
     * @param request        the originating AI request
     * @param policy         the execution policy (model, thinking level, limits)
     * @param prompt         the fully built prompt specification
     * @return the cached or freshly produced {@link AiResult}
     */
    public AiResult extract(UUID organizationId, AiModel model, AiRequest request,
                            AiExecutionPolicy policy, AiPromptSpec prompt) {
        String key = sha256(organizationId
                + "|" + sha256(request.input() != null ? request.input() : "")
                + "|" + request.task().name()
                + "|" + prompt.promptVersion()
                + "|" + policy.model().model());
        return cache.lookup(key).orElseGet(() -> {
            AiResult r = gateway.run(model, request, policy, prompt);
            cache.store(key, r);
            return r;
        });
    }

    /**
     * Computes the lowercase hex SHA-256 of the given value. A {@code null} input
     * is treated as the empty string.
     */
    private static String sha256(String value) {
        String safe = value != null ? value : "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(safe.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(Character.forDigit((b >> 4) & 0xF, 16));
                sb.append(Character.forDigit(b & 0xF, 16));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException ex) {
            // SHA-256 is a mandated JDK algorithm; absence is unrecoverable.
            throw new IllegalStateException("SHA-256 indisponivel na JVM", ex);
        }
    }
}
