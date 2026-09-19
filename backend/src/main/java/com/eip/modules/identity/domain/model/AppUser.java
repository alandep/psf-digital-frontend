package com.eip.modules.identity.domain.model;

import java.util.UUID;

/**
 * Pure domain representation of an application user.
 *
 * @param id            the user identifier
 * @param name          the user display name
 * @param email         the user email address
 * @param cpfLookupHash the deterministic lookup hash of the user's CPF
 */
public record AppUser(UUID id, String name, String email, String cpfLookupHash) {
}
