package com.eip.modules.identity.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Pure domain representation of a user's login credential.
 *
 * @param userId             the owning user id (one credential per user)
 * @param passwordHash       the encoded password hash
 * @param mustChangePassword whether the user must rotate the password on next login
 * @param lockedUntil        instant until which password login is blocked ({@code null} when not locked)
 * @param failedAttempts     consecutive wrong-password attempts since the last success/lock
 */
public record UserCredential(UUID userId, String passwordHash, boolean mustChangePassword,
                             OffsetDateTime lockedUntil, int failedAttempts) {

    /**
     * @param now reference instant
     * @return {@code true} when the credential is temporarily locked at {@code now}
     */
    public boolean isLockedAt(OffsetDateTime now) {
        return lockedUntil != null && lockedUntil.isAfter(now);
    }
}
