package com.eip.modules.identity.domain.model;

import java.util.UUID;

/**
 * Pure domain representation of a user's login credential.
 *
 * @param userId             the owning user id (one credential per user)
 * @param passwordHash       the encoded password hash
 * @param mustChangePassword whether the user must rotate the password on next login
 */
public record UserCredential(UUID userId, String passwordHash, boolean mustChangePassword) {
}
