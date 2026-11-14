package com.eip.modules.identity.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.identity.domain.model.TotpFactor;

/**
 * Outbound port: persistence of the TOTP authenticator factor and the
 * single-use recovery codes of a user. Secrets are stored encrypted and
 * recovery codes only as hashes.
 */
public interface MfaRepositoryPort {

    /** @return the user's TOTP factor (pending or active), if any. */
    Optional<TotpFactor> findTotp(UUID userId);

    /**
     * Stores (or replaces) a PENDING TOTP factor with {@code last_used_step = 0}.
     * Never overwrites an ACTIVE factor; callers must check beforehand.
     */
    void savePending(UUID userId, String secretCiphertext, int keyVersion);

    /**
     * Activates the pending factor, records the accepted step and replaces the
     * recovery codes with the given hashes.
     */
    void activate(UUID userId, long step, List<String> recoveryHashes);

    /** Persists the last accepted TOTP step (replay protection). */
    void updateLastStep(UUID userId, long step);

    /**
     * Marks an unused recovery code as used.
     *
     * @return {@code true} when exactly one unused code matched
     */
    boolean consumeRecoveryCode(UUID userId, String hash);

    /** @return number of unused recovery codes. */
    int remainingRecoveryCodes(UUID userId);

    /** Deletes all recovery codes of the user and inserts the given hashes. */
    void replaceRecoveryCodes(UUID userId, List<String> hashes);

    /** Removes the TOTP factor and every recovery code of the user. */
    void disable(UUID userId);
}
