package com.eip.modules.bi.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link DashboardEntity}.
 */
public interface DashboardJpaRepository extends JpaRepository<DashboardEntity, UUID> {

    Optional<DashboardEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<DashboardEntity> findByOrganizationId(UUID organizationId);
}
