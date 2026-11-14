package com.eip.modules.identity.application;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.eip.modules.identity.domain.model.AppUser;
import com.eip.modules.identity.domain.model.AuthState;
import com.eip.modules.identity.domain.model.SecurityEventType;
import com.eip.modules.identity.domain.model.UserCredential;
import com.eip.modules.identity.domain.port.out.AuthAuditPort;
import com.eip.modules.identity.domain.port.out.CredentialRepositoryPort;
import com.eip.modules.identity.domain.port.out.UserRepositoryPort;
import com.eip.modules.organization.application.OrganizationQueryService;
import com.eip.modules.organization.application.OrganizationQueryService.OrganizationOption;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.mail.EmailSender;
import com.eip.platform.mail.EmailTemplates;

import lombok.extern.slf4j.Slf4j;

/**
 * Orchestrates the stepped authentication flow consumed by the SPA:
 * identify &rarr; verify password &rarr; verify MFA &rarr; select organization.
 *
 * <p>Security controls: anti-enumeration on identify, temporary account lockout
 * after repeated wrong passwords, mandatory second factor (authenticator app,
 * e-mail code or recovery code) with attempt/resend limits, and an audit trail
 * of every relevant event.
 *
 * <p>Pending challenges are held in an in-memory store keyed by an opaque
 * challenge id and expire after 15 minutes. The HTTP session is established by
 * the controller once the flow reaches {@link AuthState#AUTHENTICATED}.
 * TODO: move the challenge store to a distributed store for multi-instance deploys.
 */
@Slf4j
@Service
public class AuthService {

    /** MFA method codes exchanged with the SPA. */
    public static final String METHOD_TOTP = "TOTP";
    public static final String METHOD_EMAIL = "EMAIL";
    public static final String METHOD_RECOVERY = "RECOVERY";

    // DEV: fallback seeded user so the front's CPF-first flow keeps working.
    private static final String SEEDED_EMAIL = "alan@eip.exemplo";
    private static final Duration CHALLENGE_TTL = Duration.ofMinutes(15);
    private static final int PURGE_THRESHOLD = 10_000;
    private static final String ACTIVE_STATUS = "ACTIVE";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepositoryPort userRepository;
    private final CredentialRepositoryPort credentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrganizationQueryService organizationQueryService;
    private final MfaService mfaService;
    private final AuthAuditPort auditPort;
    private final EmailSender emailSender;

    private final boolean devFallbackUser;
    private final int maxPasswordAttempts;
    private final int lockMinutes;
    private final int codeTtlMinutes;
    private final int maxMfaAttempts;
    private final int resendCooldownSeconds;
    private final int maxSends;

    /** Encoded throw-away password used to equalize timing for unknown users. */
    private final String dummyHash;

    private final ConcurrentHashMap<String, PendingAuth> challenges = new ConcurrentHashMap<>();

    public AuthService(UserRepositoryPort userRepository,
                       CredentialRepositoryPort credentialRepository,
                       PasswordEncoder passwordEncoder,
                       OrganizationQueryService organizationQueryService,
                       MfaService mfaService,
                       AuthAuditPort auditPort,
                       EmailSender emailSender,
                       @Value("${eip.auth.dev-fallback-user:false}") boolean devFallbackUser,
                       @Value("${eip.auth.max-password-attempts:5}") int maxPasswordAttempts,
                       @Value("${eip.auth.lock-minutes:15}") int lockMinutes,
                       @Value("${eip.auth.mfa.code-ttl-minutes:10}") int codeTtlMinutes,
                       @Value("${eip.auth.mfa.max-attempts:5}") int maxMfaAttempts,
                       @Value("${eip.auth.mfa.resend-cooldown-seconds:60}") int resendCooldownSeconds,
                       @Value("${eip.auth.mfa.max-sends:5}") int maxSends) {
        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.organizationQueryService = organizationQueryService;
        this.mfaService = mfaService;
        this.auditPort = auditPort;
        this.emailSender = emailSender;
        this.devFallbackUser = devFallbackUser;
        this.maxPasswordAttempts = Math.max(1, maxPasswordAttempts);
        this.lockMinutes = Math.max(1, lockMinutes);
        this.codeTtlMinutes = Math.max(1, codeTtlMinutes);
        this.maxMfaAttempts = Math.max(1, maxMfaAttempts);
        this.resendCooldownSeconds = Math.max(0, resendCooldownSeconds);
        this.maxSends = Math.max(1, maxSends);
        this.dummyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    /** In-flight authentication state for a single challenge (guarded by {@link #lock}). */
    private static final class PendingAuth {
        final ReentrantLock lock = new ReentrantLock();
        final UUID userId;
        final Instant createdAt;
        AuthState state;
        String userName;
        String email;
        String emailMasked;
        List<String> mfaMethods = List.of();
        String emailCodeHash;
        Instant emailCodeExpiresAt;
        Instant lastEmailSentAt;
        int emailSends;
        int mfaAttempts;

        PendingAuth(UUID userId, AuthState state, Instant createdAt) {
            this.userId = userId;
            this.state = state;
            this.createdAt = createdAt;
        }

        boolean isExpired(Instant now) {
            return createdAt.plus(CHALLENGE_TTL).isBefore(now);
        }
    }

    /**
     * Result returned to the SPA at each step of the auth flow.
     *
     * @param state                    the current auth state
     * @param challengeId              opaque id to carry to the next step (may be {@code null})
     * @param userName                 display name of the identified user (may be {@code null})
     * @param cpfMasked                masked identifier for display (may be {@code null})
     * @param organizations            selectable organizations (only for org selection)
     * @param message                  optional human-readable message (errors / hints)
     * @param mfaMethods               second-factor methods available ({@code TOTP}, {@code EMAIL}, {@code RECOVERY})
     * @param emailMasked              masked e-mail receiving MFA codes (may be {@code null})
     * @param resendAvailableInSeconds seconds until an e-mail code can be resent (may be {@code null})
     */
    public record AuthChallenge(AuthState state, String challengeId, String userName,
                                String cpfMasked, List<OrganizationOption> organizations,
                                String message, List<String> mfaMethods, String emailMasked,
                                Integer resendAvailableInSeconds) {
    }

    // ------------------------------------------------------------------ step 1

    /**
     * Step 1 — identify the user by email or CPF. Always returns
     * {@code PASSWORD_REQUIRED} (anti-enumeration): unknown identifiers get an
     * unbound challenge that fails generically at the password step.
     */
    public AuthChallenge identify(String identifier) {
        AppUser user = resolveUser(identifier).orElse(null);
        String challengeId = UUID.randomUUID().toString();
        store(challengeId, new PendingAuth(user == null ? null : user.id(),
                AuthState.PASSWORD_REQUIRED, Instant.now()));
        return new AuthChallenge(AuthState.PASSWORD_REQUIRED, challengeId,
                user == null ? null : user.name(), maskIdentifier(identifier), List.of(),
                "Informe sua senha para continuar", List.of(), null, null);
    }

    // ------------------------------------------------------------------ step 2

    /**
     * Step 2 — verify the password. Applies temporary lockout after
     * {@code eip.auth.max-password-attempts} failures. On success advances to
     * {@code MFA_REQUIRED} and, when the user has no authenticator app, sends
     * the e-mail code automatically.
     */
    public AuthChallenge verifyPassword(String challengeId, String password, String ip) {
        PendingAuth pending = find(challengeId);
        if (pending == null || pending.userId == null) {
            burnPasswordCheck(password);
            return invalidCredentials(challengeId);
        }
        return withLock(pending, () -> doVerifyPassword(challengeId, pending, password, ip));
    }

    private AuthChallenge doVerifyPassword(String challengeId, PendingAuth pending,
                                           String password, String ip) {
        if (pending.state != AuthState.PASSWORD_REQUIRED) {
            return invalidCredentials(challengeId);
        }
        UUID userId = pending.userId;
        UserCredential credential = credentialRepository.findByUserId(userId).orElse(null);
        if (credential == null) {
            burnPasswordCheck(password);
            return invalidCredentials(challengeId);
        }
        OffsetDateTime now = OffsetDateTime.now();
        if (credential.isLockedAt(now)) {
            long seconds = Duration.between(now, credential.lockedUntil()).toSeconds();
            discard(challengeId);
            return locked(Math.max(1, (seconds + 59) / 60));
        }
        if (!passwordMatches(password, credential.passwordHash())) {
            int remaining = credentialRepository.registerFailedAttempt(
                    userId, maxPasswordAttempts, lockMinutes);
            auditPort.recordEvent(userId, null, SecurityEventType.LOGIN_FAILED, ip);
            if (remaining <= 0) {
                auditPort.recordEvent(userId, null, SecurityEventType.ACCOUNT_LOCKED, ip);
                discard(challengeId);
                return locked(lockMinutes);
            }
            return invalidCredentials(challengeId);
        }
        if (credential.failedAttempts() > 0) {
            credentialRepository.clearFailedAttempts(userId);
        }
        String status = auditPort.accountStatus(userId).orElse(null);
        AppUser user = userRepository.findById(userId).orElse(null);
        if (!ACTIVE_STATUS.equalsIgnoreCase(status) || user == null) {
            discard(challengeId);
            return terminal(AuthState.ACCOUNT_DISABLED,
                    "Conta desativada. Fale com o administrador da sua empresa.");
        }
        pending.state = AuthState.MFA_REQUIRED;
        pending.userName = user.name();
        pending.email = user.email();
        pending.emailMasked = Digests.maskEmail(user.email());
        pending.mfaAttempts = 0;
        if (mfaService.hasActiveTotp(userId)) {
            pending.mfaMethods = List.of(METHOD_TOTP, METHOD_EMAIL, METHOD_RECOVERY);
            return mfaChallenge(challengeId, pending,
                    "Informe o codigo do seu aplicativo autenticador", null);
        }
        pending.mfaMethods = List.of(METHOD_EMAIL);
        dispatchEmailCode(challengeId, pending, ip);
        return mfaChallenge(challengeId, pending,
                "Enviamos um codigo de 6 digitos para " + pending.emailMasked,
                resendCooldownSeconds);
    }

    // ------------------------------------------------------------------ step 3

    /**
     * Sends (or resends) the e-mail verification code of an {@code MFA_REQUIRED}
     * challenge, honouring the resend cooldown and the per-challenge send limit.
     */
    public AuthChallenge sendEmailCode(String challengeId, String ip) {
        PendingAuth pending = find(challengeId);
        if (pending == null || pending.userId == null) {
            return expired();
        }
        return withLock(pending, () -> {
            if (pending.state != AuthState.MFA_REQUIRED) {
                return expired();
            }
            Instant now = Instant.now();
            if (pending.lastEmailSentAt != null) {
                long elapsed = Duration.between(pending.lastEmailSentAt, now).toSeconds();
                if (elapsed < resendCooldownSeconds) {
                    int wait = (int) (resendCooldownSeconds - elapsed);
                    return mfaChallenge(challengeId, pending,
                            "Aguarde " + wait + " s para reenviar o codigo.", wait);
                }
            }
            if (pending.emailSends >= maxSends) {
                return mfaChallenge(challengeId, pending,
                        "Limite de reenvios atingido. Reinicie o login.", null);
            }
            dispatchEmailCode(challengeId, pending, ip);
            return mfaChallenge(challengeId, pending,
                    "Enviamos um codigo de 6 digitos para " + pending.emailMasked,
                    resendCooldownSeconds);
        });
    }

    /**
     * Step 3 — verify the second factor ({@code TOTP}, {@code EMAIL} or
     * {@code RECOVERY}; defaults to TOTP when the user has an authenticator app,
     * otherwise EMAIL). On success, records the login and resolves the
     * organizations: one &rarr; {@code AUTHENTICATED}; several &rarr;
     * {@code ORGANIZATION_SELECTION_REQUIRED}.
     */
    public AuthChallenge verifyMfa(String challengeId, String code, String method, String ip) {
        PendingAuth pending = find(challengeId);
        if (pending == null || pending.userId == null) {
            return expired();
        }
        return withLock(pending, () -> doVerifyMfa(challengeId, pending, code, method, ip));
    }

    private AuthChallenge doVerifyMfa(String challengeId, PendingAuth pending, String code,
                                      String method, String ip) {
        if (pending.state != AuthState.MFA_REQUIRED) {
            return expired();
        }
        UUID userId = pending.userId;
        boolean totpAvailable = pending.mfaMethods.contains(METHOD_TOTP);
        String chosen = method == null || method.isBlank()
                ? (totpAvailable ? METHOD_TOTP : METHOD_EMAIL)
                : method.trim().toUpperCase(Locale.ROOT);

        boolean ok;
        switch (chosen) {
            case METHOD_TOTP -> ok = totpAvailable && mfaService.verifyTotp(userId, code);
            case METHOD_RECOVERY -> {
                ok = totpAvailable && mfaService.verifyRecovery(userId, code);
                if (ok) {
                    auditPort.recordEvent(userId, null, SecurityEventType.RECOVERY_CODE_USED, ip);
                }
            }
            case METHOD_EMAIL -> {
                if (pending.emailCodeHash != null && pending.emailCodeExpiresAt != null
                        && Instant.now().isAfter(pending.emailCodeExpiresAt)) {
                    pending.emailCodeHash = null;
                    pending.emailCodeExpiresAt = null;
                    return mfaChallenge(challengeId, pending,
                            "Codigo expirado. Solicite um novo.", resendWait(pending));
                }
                ok = matchesEmailCode(challengeId, pending, code);
                if (ok) {
                    pending.emailCodeHash = null; // single use
                    pending.emailCodeExpiresAt = null;
                }
            }
            default -> ok = false;
        }

        if (!ok) {
            pending.mfaAttempts++;
            auditPort.recordEvent(userId, null, SecurityEventType.MFA_FAILED, ip);
            if (pending.mfaAttempts >= maxMfaAttempts) {
                discard(challengeId);
                return terminal(AuthState.IDENTIFICATION_REQUIRED,
                        "Muitas tentativas invalidas. Reinicie o login.");
            }
            int remaining = maxMfaAttempts - pending.mfaAttempts;
            return mfaChallenge(challengeId, pending,
                    "Codigo invalido. Restam " + remaining + " tentativa(s).", null);
        }

        auditPort.recordEvent(userId, null, SecurityEventType.MFA_SUCCEEDED, ip);
        // Also accepts pending invitations, so it must run before loading organizations.
        auditPort.recordSuccessfulLogin(userId);
        auditPort.recordEvent(userId, null, SecurityEventType.LOGIN_SUCCEEDED, ip);

        List<OrganizationOption> organizations = organizationQueryService.membershipsOf(userId);
        if (organizations.isEmpty()) {
            discard(challengeId);
            return terminal(AuthState.IDENTIFICATION_REQUIRED,
                    "Seu usuario nao possui empresa ativa. Fale com o administrador.");
        }
        if (organizations.size() == 1) {
            pending.state = AuthState.AUTHENTICATED;
            return new AuthChallenge(AuthState.AUTHENTICATED, challengeId, pending.userName, null,
                    organizations, null, pending.mfaMethods, pending.emailMasked, null);
        }
        pending.state = AuthState.ORGANIZATION_SELECTION_REQUIRED;
        return new AuthChallenge(AuthState.ORGANIZATION_SELECTION_REQUIRED, challengeId,
                pending.userName, null, organizations, "Selecione a organizacao",
                pending.mfaMethods, pending.emailMasked, null);
    }

    // ------------------------------------------------------------------ step 4

    /**
     * Step 4 — select the organization. Requires the challenge to be at
     * {@code ORGANIZATION_SELECTION_REQUIRED}, verifies membership and reaches
     * {@code AUTHENTICATED}. The controller then establishes the HTTP session.
     */
    public AuthChallenge selectOrganization(String challengeId, UUID organizationId) {
        PendingAuth pending = find(challengeId);
        if (pending == null || pending.userId == null) {
            return expired();
        }
        return withLock(pending, () -> {
            if (pending.state != AuthState.ORGANIZATION_SELECTION_REQUIRED) {
                return expired();
            }
            if (organizationId == null
                    || !organizationQueryService.isMember(pending.userId, organizationId)) {
                List<OrganizationOption> organizations =
                        organizationQueryService.membershipsOf(pending.userId);
                return new AuthChallenge(AuthState.ORGANIZATION_SELECTION_REQUIRED, challengeId,
                        pending.userName, null, organizations, "Organizacao invalida",
                        pending.mfaMethods, pending.emailMasked, null);
            }
            pending.state = AuthState.AUTHENTICATED;
            return new AuthChallenge(AuthState.AUTHENTICATED, challengeId, pending.userName, null,
                    List.of(), null, pending.mfaMethods, pending.emailMasked, null);
        });
    }

    /** @return the user id bound to a challenge, or empty. Used by the controller. */
    public Optional<UUID> userIdOf(String challengeId) {
        PendingAuth pending = find(challengeId);
        return pending == null ? Optional.empty() : Optional.ofNullable(pending.userId);
    }

    /** Discards a challenge once the session has been established (or the flow ended). */
    public void discard(String challengeId) {
        if (challengeId != null) {
            challenges.remove(challengeId);
        }
    }

    // ------------------------------------------------------------- self-service

    /**
     * Changes the password of an authenticated user after re-checking the
     * current one. Policy: at least 8 characters with letters and digits,
     * different from the current password.
     */
    public void changePassword(UUID userId, String currentPassword, String newPassword, String ip) {
        UserCredential credential = credentialRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessRuleException("Senha atual incorreta."));
        if (!passwordMatches(currentPassword, credential.passwordHash())) {
            throw new BusinessRuleException("Senha atual incorreta.");
        }
        if (!isStrongEnough(newPassword)) {
            throw new BusinessRuleException(
                    "A nova senha deve ter ao menos 8 caracteres, com letras e numeros.");
        }
        if (newPassword.equals(currentPassword)) {
            throw new BusinessRuleException("A nova senha deve ser diferente da senha atual.");
        }
        credentialRepository.changePassword(userId, passwordEncoder.encode(newPassword));
        auditPort.recordEvent(userId, null, SecurityEventType.PASSWORD_CHANGED, ip);
    }

    /** Records a {@code LOGOUT} security event. */
    public void auditLogout(UUID userId, UUID organizationId, String ip) {
        auditPort.recordEvent(userId, organizationId, SecurityEventType.LOGOUT, ip);
    }

    /** Records a {@code SESSION_REVOKED} security event. */
    public void auditSessionRevoked(UUID userId, UUID organizationId, String ip) {
        auditPort.recordEvent(userId, organizationId, SecurityEventType.SESSION_REVOKED, ip);
    }

    // ------------------------------------------------------------------ helpers

    private void dispatchEmailCode(String challengeId, PendingAuth pending, String ip) {
        String code = String.format(Locale.ROOT, "%06d", RANDOM.nextInt(1_000_000));
        Instant now = Instant.now();
        pending.emailCodeHash = Digests.sha256Hex(challengeId + ":" + code);
        pending.emailCodeExpiresAt = now.plus(Duration.ofMinutes(codeTtlMinutes));
        pending.lastEmailSentAt = now;
        pending.emailSends++;
        EmailTemplates.Rendered mail = EmailTemplates.mfaCode(pending.userName, code, codeTtlMinutes);
        emailSender.send(pending.email, mail.subject(), mail.text(), mail.html());
        auditPort.recordEvent(pending.userId, null, SecurityEventType.MFA_EMAIL_SENT, ip);
    }

    private static boolean matchesEmailCode(String challengeId, PendingAuth pending, String code) {
        if (pending.emailCodeHash == null || code == null) {
            return false;
        }
        String normalized = code.replaceAll("\\s", "");
        byte[] given = Digests.sha256Hex(challengeId + ":" + normalized)
                .getBytes(StandardCharsets.US_ASCII);
        byte[] expected = pending.emailCodeHash.getBytes(StandardCharsets.US_ASCII);
        return MessageDigest.isEqual(expected, given);
    }

    /** @return seconds left in the resend cooldown of the challenge (0 when a resend is allowed). */
    private Integer resendWait(PendingAuth pending) {
        if (pending.lastEmailSentAt == null) {
            return 0;
        }
        long elapsed = Duration.between(pending.lastEmailSentAt, Instant.now()).toSeconds();
        return (int) Math.max(0, resendCooldownSeconds - elapsed);
    }

    private AuthChallenge mfaChallenge(String challengeId, PendingAuth pending, String message,
                                       Integer resendAvailableInSeconds) {
        return new AuthChallenge(AuthState.MFA_REQUIRED, challengeId, pending.userName, null,
                List.of(), message, pending.mfaMethods, pending.emailMasked,
                resendAvailableInSeconds);
    }

    private static AuthChallenge terminal(AuthState state, String message) {
        return new AuthChallenge(state, null, null, null, List.of(), message, List.of(), null, null);
    }

    private static AuthChallenge expired() {
        return terminal(AuthState.IDENTIFICATION_REQUIRED, "Sessao expirada, reinicie o login");
    }

    private static AuthChallenge locked(long minutes) {
        return terminal(AuthState.ACCOUNT_LOCKED,
                "Conta bloqueada temporariamente por excesso de tentativas. Tente novamente em "
                        + minutes + " minuto(s) ou use \"Esqueci minha senha\".");
    }

    private static AuthChallenge invalidCredentials(String challengeId) {
        // Do not reveal which field was wrong (anti-enumeration).
        return new AuthChallenge(AuthState.PASSWORD_REQUIRED, challengeId, null, null,
                List.of(), "Credenciais invalidas", List.of(), null, null);
    }

    private boolean passwordMatches(String raw, String hash) {
        if (raw == null || raw.isEmpty() || hash == null) {
            return false;
        }
        try {
            return passwordEncoder.matches(raw, hash);
        } catch (IllegalArgumentException ex) {
            log.warn("Hash de senha em formato nao suportado");
            return false;
        }
    }

    /** Spends comparable CPU time for unknown users (timing-based enumeration). */
    private void burnPasswordCheck(String password) {
        passwordMatches(password == null || password.isEmpty() ? "x" : password, dummyHash);
    }

    private static boolean isStrongEnough(String password) {
        return password != null && password.length() >= 8
                && password.chars().anyMatch(Character::isLetter)
                && password.chars().anyMatch(Character::isDigit);
    }

    private static <T> T withLock(PendingAuth pending, Supplier<T> action) {
        pending.lock.lock();
        try {
            return action.get();
        } finally {
            pending.lock.unlock();
        }
    }

    private PendingAuth find(String challengeId) {
        if (challengeId == null || challengeId.isBlank()) {
            return null;
        }
        PendingAuth pending = challenges.get(challengeId);
        if (pending == null) {
            return null;
        }
        if (pending.isExpired(Instant.now())) {
            challenges.remove(challengeId, pending);
            return null;
        }
        return pending;
    }

    private void store(String challengeId, PendingAuth pending) {
        if (challenges.size() > PURGE_THRESHOLD) {
            Instant now = Instant.now();
            challenges.entrySet().removeIf(e -> e.getValue().isExpired(now));
        }
        challenges.put(challengeId, pending);
    }

    private Optional<AppUser> resolveUser(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return devFallback();
        }
        String value = identifier.trim();
        if (value.contains("@")) {
            Optional<AppUser> byEmail = userRepository.findByEmail(value);
            if (byEmail.isPresent()) {
                return byEmail;
            }
        } else {
            String digits = value.replaceAll("\\D", "");
            if (!digits.isEmpty()) {
                Optional<AppUser> byCpf = userRepository.findByCpfLookupHash(cpfHash(digits));
                if (byCpf.isPresent()) {
                    return byCpf;
                }
            }
        }
        return devFallback();
    }

    private Optional<AppUser> devFallback() {
        return devFallbackUser ? userRepository.findByEmail(SEEDED_EMAIL) : Optional.empty();
    }

    private static String cpfHash(String digitsOnly) {
        return Digests.sha256Hex(digitsOnly);
    }

    private String maskIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return null;
        }
        String value = identifier.trim();
        if (value.contains("@")) {
            return Digests.maskEmail(value);
        }
        String digits = value.replaceAll("\\D", "");
        if (digits.length() >= 4) {
            String last = digits.substring(digits.length() - 2);
            return "\u2022\u2022\u2022.\u2022\u2022\u2022.\u2022\u2022\u2022-" + last;
        }
        return "\u2022\u2022\u2022";
    }
}
