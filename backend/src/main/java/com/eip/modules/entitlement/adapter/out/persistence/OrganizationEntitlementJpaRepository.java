package com.eip.modules.entitlement.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA repository for the tenant-scoped {@link OrganizationEntitlementEntity}. */
public interface OrganizationEntitlementJpaRepository
        extends JpaRepository<OrganizationEntitlementEntity, OrganizationEntitlementId> {

    List<OrganizationEntitlementEntity> findByOrganizationId(UUID organizationId);
}