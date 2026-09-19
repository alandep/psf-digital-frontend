package com.eip.modules.organization.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.organization.domain.model.Membership;
import com.eip.modules.organization.domain.model.Organization;

/**
 * Outbound port: read access to organizations and memberships for the
 * organization query use cases.
 */
public interface OrganizationMembershipRepositoryPort {

    List<Membership> findActiveMemberships(UUID userId);

    boolean isActiveMember(UUID userId, UUID orgId);

    Optional<Organization> findOrganization(UUID orgId);
}
