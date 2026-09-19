package com.eip.modules.organization.adapter.out.persistence;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link OrganizationEntity}.
 */
public interface OrganizationJpaRepository extends JpaRepository<OrganizationEntity, UUID> {
}
