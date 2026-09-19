package com.eip.modules.compliance.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link LicencaEntity}.
 */
public interface LicencaJpaRepository extends JpaRepository<LicencaEntity, UUID> {

    Optional<LicencaEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<LicencaEntity> findByOrganizationId(UUID organizationId);

    List<LicencaEntity> findByOrganizationIdAndStatus(UUID organizationId, String status);
}
