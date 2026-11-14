package com.eip.modules.identity.domain.port.out;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.identity.domain.model.UserCredential;

/**
 * Outbound port: access to user credentials for the authentication flow
 * (lookup, brute-force counters/lockout and password rotation).
 */
public interface CredentialRepositoryPort {

    Optional<UserCredential> findByUserId(UUID userId);

    /**
     * Registers a wrong-password attempt. When the counter reaches
     * {@code maxAttempts} the credential is locked for {@code lockMinutes} and the
     * counter is reset to zero.
     *
     * @return remaining attempts before lockout; {@code 0} when this call locked the account
     */
    int registerFailedAttempt(UUID userId, int maxAttempts, int lockMinutes);

    /** Resets the failed-attempt counter (successful password check). */
    void clearFailedAttempts(UUID userId);

    /**
     * Replaces the password hash, stamps {@code password_changed_at}, clears the
     * must-change flag, the failed-attempt counter and any lock.
     */
    void changePassword(UUID userId, String newHash);

    /** @return when the password was last changed, if known. */
    Optional<OffsetDateTime> passwordChangedAt(UUID userId);
}
