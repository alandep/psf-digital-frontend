package com.eip.modules.compliance.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link ScreeningEntity}.
 */
public interface ScreeningJpaRepository extends JpaRepository<ScreeningEntity, UUID> {

    Optional<ScreeningEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<ScreeningEntity> findByOrganizationId(UUID organizationId);

    List<ScreeningEntity> findByOrganizationIdAndStatus(UUID organizationId, String status);
}
