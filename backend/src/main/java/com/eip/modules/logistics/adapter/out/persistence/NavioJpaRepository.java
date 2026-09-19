package com.eip.modules.logistics.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link NavioEntity}.
 */
public interface NavioJpaRepository extends JpaRepository<NavioEntity, UUID> {

    List<NavioEntity> findByOrganizationId(UUID organizationId);
}
