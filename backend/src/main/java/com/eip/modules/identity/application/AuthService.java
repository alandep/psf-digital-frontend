package com.eip.modules.identity.application;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.eip.modules.identity.adapter.out.persistence.AppUserEntity;
import com.eip.modules.identity.adapter.out.persistence.AppUserJpaRepository;
import com.eip.modules.identity.adapter.out.persistence.UserCredentialEntity;
import com.eip.modules.identity.adapter.out.persistence.UserCredentialJpaRepository;
import com.eip.modules.identity.domain.model.AuthState;
import com.eip.modules.organization.application.OrganizationQueryService;
import com.eip.modules.organization.application.OrganizationQueryService.OrganizationOption;

import lombok.RequiredArgsConstructor;

/**
 * Orchestrates the stepped authentication flow consumed by the SPA:
 * identify &rarr; verify password &rarr; verify MFA &rarr; select organization.
 *
 * <p>Pending challenges are held in an in-memory store keyed by an opaque
 * challenge id. The HTTP session is established by the controller once the flow
 * reaches {@link AuthState#AUTHENTICATED}.
 *
 * <p>TODO: replace the in-memory store with a distributed/session-bound store,
 * add real TOTP MFA, rate limiting and anti-enumeration hardening.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    // DEV: fallback seeded user so the front's CPF-first flow keeps working.
    private static final String SEEDED_EMAIL = "alan@eip.exemplo";

    private final AppUserJpaRepository userRepository;
    private final UserCredentialJpaRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrganizationQueryService organizationQueryService;

    private final ConcurrentHashMap<String, PendingAuth> challenges = new ConcurrentHashMap<>();

    /** In-flight authentication state for a single challenge. */
    public record PendingAuth(UUID userId, AuthState state) {
    }

    /**
     * Result returned to the SPA at each step of the auth flow.
     *
     * @param state         the current auth state
     * @param challengeId   opaque id to carry to the next step (may be {@code null})
     * @param userName      display name of the identified user (may be {@code null})
     * @param cpfMasked     masked identifier for display (may be {@code null})
     * @param organizations selectable organizations (only for org selection)
     * @param message       optional human-readable message (errors / hints)
     */
    public record AuthChallenge(AuthState state, String challengeId, String userName,
                                String cpfMasked, List<OrganizationOption> organizations,
                                String message) {
    }

    /**
     * Step 1 — identify the user by email or CPF. Returns {@code PASSWORD_REQUIRED}.
     *
     * <p>To avoid account enumeration we always advance to {@code PASSWORD_REQUIRED}.
     * The front sends a CPF; for dev we fall back to the seeded user when no
     * matching record is found. TODO: hash+lookup the CPF and drop the fallback.
     */
    public AuthChallenge identify(String identifier) {
        AppUserEntity user = resolveUser(identifier).orElse(null);
        if (user == null) {
            // Anti-enumeration: still hand back a challenge with a generic message.
            String challengeId = UUID.randomUUID().toString();
            // No user bound; a later verifyPassword will fail generically.
            challenges.put(challengeId, new PendingAuth(null, AuthState.PASSWORD_REQUIRED));
            return new AuthChallenge(AuthState.PASSWORD_REQUIRED, challengeId,
                    null, maskIdentifier(identifier), List.of(),
                    "Informe sua senha para continuar");
        }
        String challengeId = UUID.randomUUID().toString();
        challenges.put(challengeId, new PendingAuth(user.getId(), AuthState.PASSWORD_REQUIRED));
        return new AuthChallenge(AuthState.PASSWORD_REQUIRED, challengeId,
                user.getName(), maskIdentifier(identifier), List.of(),
                "Informe sua senha para continuar");
    }

    /**
     * Step 2 — verify the password. On success advances to {@code MFA_REQUIRED};
     * on failure stays at {@code PASSWORD_REQUIRED} with a generic message.
     */
    public AuthChallenge verifyPassword(String challengeId, String password) {
        PendingAuth pending = challenges.get(challengeId);
        if (pending == null || pending.userId() == null) {
            return invalidCredentials(challengeId);
        }
        Optional<UserCredentialEntity> credential = credentialRepository.findById(pending.userId());
        boolean matches = credential
                .map(c -> passwordEncoder.matches(password, c.getPasswordHash()))
                .orElse(false);
        if (!matches) {
            return invalidCredentials(challengeId);
        }
        challenges.put(challengeId, new PendingAuth(pending.userId(), AuthState.MFA_REQUIRED));
        return new AuthChallenge(AuthState.MFA_REQUIRED, challengeId, null, null,
                List.of(), "Informe o codigo de verificacao");
    }

    /**
     * Step 3 — verify the MFA code. Any 6-digit code passes (mock TODO: real TOTP).
     * If the user has exactly one organization it is auto-selected and the flow
     * reaches {@code AUTHENTICATED}; otherwise {@code ORGANIZATION_SELECTION_REQUIRED}.
     */
    public AuthChallenge verifyMfa(String challengeId, String code) {
        PendingAuth pending = challenges.get(challengeId);
        if (pending == null || pending.userId() == null
                || pending.state() != AuthState.MFA_REQUIRED) {
            return new AuthChallenge(AuthState.MFA_REQUIRED, challengeId, null, null,
                    List.of(), "Codigo invalido");
        }
        // TODO: replace with real TOTP verification.
        if (code == null || !code.matches("\\d{6}")) {
            return new AuthChallenge(AuthState.MFA_REQUIRED, challengeId, null, null,
                    List.of(), "Codigo invalido");
        }
        List<OrganizationOption> organizations =
                organizationQueryService.membershipsOf(pending.userId());
        if (organizations.size() == 1) {
            challenges.put(challengeId, new PendingAuth(pending.userId(), AuthState.AUTHENTICATED));
            return new AuthChallenge(AuthState.AUTHENTICATED, challengeId, null, null,
                    organizations, null);
        }
        challenges.put(challengeId,
                new PendingAuth(pending.userId(), AuthState.ORGANIZATION_SELECTION_REQUIRED));
        return new AuthChallenge(AuthState.ORGANIZATION_SELECTION_REQUIRED, challengeId, null, null,
                organizations, "Selecione a organizacao");
    }

    /**
     * Step 4 — select the organization. Verifies membership and reaches
     * {@code AUTHENTICATED}. The controller then establishes the HTTP session.
     */
    public AuthChallenge selectOrganization(String challengeId, UUID organizationId) {
        PendingAuth pending = challenges.get(challengeId);
        if (pending == null || pending.userId() == null) {
            return new AuthChallenge(AuthState.IDENTIFICATION_REQUIRED, null, null, null,
                    List.of(), "Sessao expirada, reinicie o login");
        }
        if (!organizationQueryService.isMember(pending.userId(), organizationId)) {
            List<OrganizationOption> organizations =
                    organizationQueryService.membershipsOf(pending.userId());
            return new AuthChallenge(AuthState.ORGANIZATION_SELECTION_REQUIRED, challengeId,
                    null, null, organizations, "Organizacao invalida");
        }
        challenges.put(challengeId, new PendingAuth(pending.userId(), AuthState.AUTHENTICATED));
        return new AuthChallenge(AuthState.AUTHENTICATED, challengeId, null, null,
                List.of(), null);
    }

    /** @return the user id bound to a challenge, or empty. Used by the controller. */
    public Optional<UUID> userIdOf(String challengeId) {
        PendingAuth pending = challenges.get(challengeId);
        return pending == null ? Optional.empty() : Optional.ofNullable(pending.userId());
    }

    /** Discards a challenge once the session has been established. */
    public void discard(String challengeId) {
        if (challengeId != null) {
            challenges.remove(challengeId);
        }
    }

    private AuthChallenge invalidCredentials(String challengeId) {
        // Do not reveal which field was wrong (anti-enumeration).
        return new AuthChallenge(AuthState.PASSWORD_REQUIRED, challengeId, null, null,
                List.of(), "Credenciais invalidas");
    }

    private Optional<AppUserEntity> resolveUser(String identifier) {
        if (identifier != null && identifier.contains("@")) {
            Optional<AppUserEntity> byEmail = userRepository.findByEmail(identifier);
            if (byEmail.isPresent()) {
                return byEmail;
            }
        }
        // TODO: hash the CPF and look up via findByCpfLookupHash.
        // DEV fallback: keep the front's CPF-first flow working with the seeded user.
        return userRepository.findByEmail(SEEDED_EMAIL);
    }

    private String maskIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return null;
        }
        String value = identifier.trim();
        if (value.contains("@")) {
            int at = value.indexOf('@');
            String local = value.substring(0, at);
            String visible = local.isEmpty() ? "" : local.substring(0, 1);
            return visible + "***" + value.substring(at);
        }
        String digits = value.replaceAll("\\D", "");
        if (digits.length() >= 4) {
            String last = digits.substring(digits.length() - 2);
            return "\u2022\u2022\u2022.\u2022\u2022\u2022.\u2022\u2022\u2022-" + last;
        }
        return "\u2022\u2022\u2022";
    }
}
