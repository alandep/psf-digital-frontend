package com.eip.modules.compliance.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link AuditEventEntity} (read-only usage).
 */
public interface AuditEventJpaRepository extends JpaRepository<AuditEventEntity, UUID> {

    List<AuditEventEntity> findTop50ByOrganizationIdOrderByOccurredAtDesc(UUID organizationId);

    List<AuditEventEntity> findTop50ByOrganizationIdAndResourceTypeOrderByOccurredAtDesc(
            UUID organizationId, String resourceType);
}
