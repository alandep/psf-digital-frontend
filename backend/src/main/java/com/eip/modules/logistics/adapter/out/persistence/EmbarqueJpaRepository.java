package com.eip.modules.logistics.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link EmbarqueEntity}.
 */
public interface EmbarqueJpaRepository extends JpaRepository<EmbarqueEntity, UUID> {

    Optional<EmbarqueEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<EmbarqueEntity> findByOrganizationId(UUID organizationId);

    List<EmbarqueEntity> findByOrganizationIdAndStatus(UUID organizationId, String status);
}
