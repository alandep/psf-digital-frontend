package com.eip.modules.admin.application;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.admin.adapter.out.persistence.AdminAppUserEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminAppUserJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.AdminMembershipEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminMembershipJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.AdminUserCredentialEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminUserCredentialJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.PasswordResetEntity;
import com.eip.modules.admin.adapter.out.persistence.PasswordResetJpaRepository;
import com.eip.platform.error.BusinessRuleException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Password activation / reset for the public auth flow. Supports the
 * "first access" of an invited user (who has only a temporary random password)
 * and ordinary "forgot password". A one-time token is stored hashed in
 * {@code password_reset}; redeeming it sets the new password, clears
 * {@code must_change_password} and activates the user's pending memberships.
 *
 * <p>Anti-enumeration: {@link #requestReset} never reveals whether the identity
 * exists; it returns an opaque result and only embeds a token when a user was
 * actually found. Email delivery is a future integration point — until then the
 * token is returned so an admin can hand the activation link to the user.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private static final long TOKEN_TTL_HOURS = 48;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AdminAppUserJpaRepository userRepo;
    private final AdminUserCredentialJpaRepository credentialRepo;
    private final AdminMembershipJpaRepository membershipRepo;
    private final PasswordResetJpaRepository resetRepo;
    private final PasswordEncoder passwordEncoder;

    /** Result of a reset request. token is non-null only when a user was found. */
    public record ResetRequestResult(boolean userFound, String token) {
    }

    /**
     * Issues an activation/reset token for the user identified by CPF or email.
     * Always succeeds from the caller's perspective (anti-enumeration).
     *
     * @param identifier CPF (digits or masked) or email
     * @param requestIp  originating IP (audit), may be null
     */
    @Transactional
    public ResetRequestResult requestReset(String identifier, String requestIp) {
        AdminAppUserEntity user = resolveUser(identifier).orElse(null);
        if (user == null) {
            return new ResetRequestResult(false, null);
        }
        // Opaque, URL-safe random token; only its hash is persisted.
        byte[] raw = new byte[32];
        RANDOM.nextBytes(raw);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);

        PasswordResetEntity pr = new PasswordResetEntity();
        pr.setId(UUID.randomUUID());
        pr.setUserId(user.getId());
        pr.setTokenHash(sha256(token));
        pr.setCreatedAt(OffsetDateTime.now());
        pr.setExpiresAt(OffsetDateTime.now().plusHours(TOKEN_TTL_HOURS));
        pr.setRequestIp(requestIp);
        resetRepo.save(pr);

        log.info("Token de ativacao/reset emitido para user={}", user.getId());
        return new ResetRequestResult(true, token);
    }

    /**
     * Issues a token directly for a known user id (used by the admin "reset
     * senha" action and the invite flow).
     */
    @Transactional
    public String issueTokenForUser(UUID userId) {
        byte[] raw = new byte[32];
        RANDOM.nextBytes(raw);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        PasswordResetEntity pr = new PasswordResetEntity();
        pr.setId(UUID.randomUUID());
        pr.setUserId(userId);
        pr.setTokenHash(sha256(token));
        pr.setCreatedAt(OffsetDateTime.now());
        pr.setExpiresAt(OffsetDateTime.now().plusHours(TOKEN_TTL_HOURS));
        resetRepo.save(pr);
        return token;
    }

    /**
     * Redeems a token: validates it, sets the new password, clears the
     * must-change flag and activates the user's pending memberships + account.
     *
     * @throws BusinessRuleException when the token is invalid/expired/used or
     *                               the password is too weak
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new BusinessRuleException("Token invalido.");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new BusinessRuleException("A senha deve ter ao menos 8 caracteres.");
        }
        PasswordResetEntity pr = resetRepo.findByTokenHash(sha256(token))
                .orElseThrow(() -> new BusinessRuleException("Token invalido ou expirado."));
        if (pr.getUsedAt() != null) {
            throw new BusinessRuleException("Este link ja foi utilizado.");
        }
        if (pr.getExpiresAt() != null && pr.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new BusinessRuleException("Este link expirou. Solicite um novo.");
        }

        UUID userId = pr.getUserId();
        OffsetDateTime now = OffsetDateTime.now();

        // Set the new password.
        AdminUserCredentialEntity cred = credentialRepo.findById(userId)
                .orElseGet(() -> {
                    AdminUserCredentialEntity c = new AdminUserCredentialEntity();
                    c.setUserId(userId);
                    c.setFailedAttempts(0);
                    return c;
                });
        cred.setPasswordHash(passwordEncoder.encode(newPassword));
        cred.setMustChangePassword(false);
        cred.setFailedAttempts(0);
        cred.setUpdatedAt(now);
        credentialRepo.save(cred);

        // Activate the user account.
        userRepo.findById(userId).ifPresent(u -> {
            u.setStatus("ACTIVE");
            userRepo.save(u);
        });

        // Activate any pending memberships (first access).
        List<AdminMembershipEntity> memberships = membershipRepo.findByUserId(userId);
        for (AdminMembershipEntity m : memberships) {
            if ("PENDING".equalsIgnoreCase(m.getStatus())) {
                m.setStatus("ACTIVE");
                membershipRepo.save(m);
            }
        }

        // Burn the token.
        pr.setUsedAt(now);
        resetRepo.save(pr);

        log.info("Senha definida/redefinida e conta ativada para user={}", userId);
    }

    private Optional<AdminAppUserEntity> resolveUser(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }
        if (identifier.contains("@")) {
            return userRepo.findByEmail(identifier.trim().toLowerCase());
        }
        String digits = identifier.replaceAll("\\D", "");
        if (digits.isEmpty()) {
            return Optional.empty();
        }
        return userRepo.findFirstByCpfLookupHashOrderByCreatedAtDesc(sha256(digits));
    }

    /** Deterministic SHA-256 hex (token hashing + CPF lookup hashing). */
    private static String sha256(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception ex) {
            return value;
        }
    }
}
