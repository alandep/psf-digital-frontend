package com.eip.modules.identity.domain.model;

/**
 * A user's TOTP authenticator factor.
 *
 * @param secretCiphertext encrypted base32 secret
 * @param lastUsedStep     last accepted RFC 6238 time step (replay protection)
 * @param active           {@code true} once enrollment was confirmed
 */
public record TotpFactor(String secretCiphertext, long lastUsedStep, boolean active) {
}