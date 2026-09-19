package com.eip.modules.crm.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link LeadEntity}.
 */
public interface LeadJpaRepository extends JpaRepository<LeadEntity, UUID> {

    Optional<LeadEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<LeadEntity> findByOrganizationId(UUID organizationId);

    List<LeadEntity> findByOrganizationIdAndStatus(UUID organizationId, String status);

    List<LeadEntity> findByOrganizationIdAndSource(UUID organizationId, String source);

    List<LeadEntity> findByOrganizationIdAndStatusAndSource(
            UUID organizationId, String status, String source);
}
