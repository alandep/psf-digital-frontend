package com.eip.modules.organization.domain.model;

import java.util.UUID;

/**
 * Pure domain representation of a user's membership in an organization.
 *
 * @param id             the membership identifier
 * @param organizationId the organization the user belongs to
 * @param userId         the member user id
 * @param role           the role held within the organization (e.g. {@code ADMINISTRADOR})
 * @param status         membership status (e.g. {@code ACTIVE})
 */
public record Membership(UUID id, UUID organizationId, UUID userId, String role, String status) {
}
