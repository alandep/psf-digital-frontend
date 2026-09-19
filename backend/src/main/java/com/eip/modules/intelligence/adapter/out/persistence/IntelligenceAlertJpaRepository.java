package com.eip.modules.intelligence.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link IntelligenceAlertEntity}.
 */
public interface IntelligenceAlertJpaRepository extends JpaRepository<IntelligenceAlertEntity, UUID> {

    List<IntelligenceAlertEntity> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);

    Optional<IntelligenceAlertEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    long countByOrganizationIdAndReadFalse(UUID organizationId);
}
