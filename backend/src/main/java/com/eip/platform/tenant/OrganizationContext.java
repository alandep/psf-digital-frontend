package com.eip.platform.tenant;

import java.util.UUID;

/**
 * Immutable per-request tenant/authentication context.
 *
 * @param organizationId the resolved tenant identifier (never {@code null})
 * @param userId          the authenticated user id, or {@code null} when anonymous
 * @param authenticated   whether the request is authenticated
 */
public record OrganizationContext(OrganizationId organizationId, UUID userId, boolean authenticated) {

    public OrganizationContext {
        if (organizationId == null) {
            throw new IllegalArgumentException("organizationId must not be null");
        }
    }

    public static OrganizationContext authenticated(OrganizationId organizationId, UUID userId) {
        return new OrganizationContext(organizationId, userId, true);
    }

    public static OrganizationContext anonymous(OrganizationId organizationId) {
        return new OrganizationContext(organizationId, null, false);
    }
}
