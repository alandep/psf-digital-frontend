package com.eip.modules.admin.application;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
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
import com.eip.platform.mail.EmailSender;
import com.eip.platform.mail.EmailTemplates;

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
@Slf4j
public class PasswordResetService {

    private static final long TOKEN_TTL_HOURS = 48;
    private static final int MAX_REQUESTS_PER_WINDOW = 3;
    private static final long REQUEST_WINDOW_MINUTES = 15;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AdminAppUserJpaRepository userRepo;
    private final AdminUserCredentialJpaRepository credentialRepo;
    private final AdminMembershipJpaRepository membershipRepo;
    private final PasswordResetJpaRepository resetRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailSender emailSender;
    private final JdbcTemplate jdbc;
    private final String appBaseUrl;

    public PasswordResetService(AdminAppUserJpaRepository userRepo,
                                AdminUserCredentialJpaRepository credentialRepo,
                                AdminMembershipJpaRepository membershipRepo,
                                PasswordResetJpaRepository resetRepo,
                                PasswordEncoder passwordEncoder,
                                EmailSender emailSender,
                                JdbcTemplate jdbc,
                                @Value("${eip.app.base-url:http://localhost:4200}") String appBaseUrl) {
        this.userRepo = userRepo;
        this.credentialRepo = credentialRepo;
        this.membershipRepo = membershipRepo;
        this.resetRepo = resetRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailSender = emailSender;
        this.jdbc = jdbc;
        String base = appBaseUrl == null ? "" : appBaseUrl.trim();
        this.appBaseUrl = base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
    }

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
        OffsetDateTime windowStart = OffsetDateTime.now().minusMinutes(REQUEST_WINDOW_MINUTES);
        if (resetRepo.countByUserIdAndCreatedAtAfter(user.getId(), windowStart) >= MAX_REQUESTS_PER_WINDOW) {
            log.warn("Limite de solicitacoes de reset atingido para user={}", user.getId());
            return new ResetRequestResult(true, null);
        }

        String token = issueToken(user.getId(), requestIp);
        boolean firstAccess = credentialRepo.findById(user.getId())
                .map(AdminUserCredentialEntity::isMustChangePassword)
                .orElse(true);
        sendActivationEmail(user, token, firstAccess);
        recordSecurityEvent(user.getId(), "PASSWORD_RESET_REQUESTED", requestIp);

        log.info("Token de ativacao/reset emitido para user={}", user.getId());
        return new ResetRequestResult(true, token);
    }

    /**
     * Issues a token for the user and e-mails the activation / reset link.
     *
     * @return the raw token (callers must never log it)
     */
    @Transactional
    public String sendActivation(UUID userId, boolean firstAccess) {
        String token = issueTokenForUser(userId);
        AdminAppUserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessRuleException("Usuario nao encontrado."));
        sendActivationEmail(user, token, firstAccess);
        return token;
    }

    private void sendActivationEmail(AdminAppUserEntity user, String token, boolean firstAccess) {
        String link = appBaseUrl + "/definir-senha?token=" + token;
        EmailTemplates.Rendered mail = EmailTemplates.activation(user.getName(), link, firstAccess);
        emailSender.send(user.getEmail(), mail.subject(), mail.text(), mail.html());
    }

    private String issueToken(UUID userId, String requestIp) {
        // Opaque, URL-safe random token; only its hash is persisted.
        byte[] raw = new byte[32];
        RANDOM.nextBytes(raw);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        PasswordResetEntity pr = new PasswordResetEntity();
        pr.setId(UUID.randomUUID());
        pr.setUserId(userId);
        pr.setTokenHash(sha256(token));
        pr.setCreatedAt(OffsetDateTime.now());
        pr.setExpiresAt(OffsetDateTime.now().plusHours(TOKEN_TTL_HOURS));
        pr.setRequestIp(requestIp);
        resetRepo.save(pr);
        return token;
    }

    /** Best-effort audit insert; never fails the main flow. */
    private void recordSecurityEvent(UUID userId, String type, String ip) {
        try {
            jdbc.update("insert into security_event(id,user_id,organization_id,type,ip) values (?,?,?,?,?)",
                    UUID.randomUUID(), userId, null, type, ip);
        } catch (RuntimeException ex) {
            log.warn("Falha ao registrar security_event {}: {}", type, ex.getClass().getSimpleName());
        }
    }

    /**
     * Issues a token directly for a known user id (used by the admin "reset
     * senha" action and the invite flow).
     */
    @Transactional
    public String issueTokenForUser(UUID userId) {
        return issueToken(userId, null);
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
        if (newPassword == null || newPassword.length() < 8
                || newPassword.chars().noneMatch(Character::isLetter)
                || newPassword.chars().noneMatch(Character::isDigit)) {
            throw new BusinessRuleException("A senha deve ter ao menos 8 caracteres, com letras e numeros.");
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
        cred.setLockedUntil(null);
        cred.setPasswordChangedAt(now);
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

        // Burn this token and every other outstanding token of the user.
        pr.setUsedAt(now);
        resetRepo.save(pr);
        for (PasswordResetEntity other : resetRepo.findByUserIdAndUsedAtIsNull(userId)) {
            other.setUsedAt(now);
            resetRepo.save(other);
        }
        recordSecurityEvent(userId, "PASSWORD_CHANGED", null);

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
