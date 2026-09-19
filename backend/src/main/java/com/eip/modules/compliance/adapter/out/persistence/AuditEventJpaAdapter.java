package com.eip.modules.compliance.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.compliance.domain.model.AuditEvent;
import com.eip.modules.compliance.domain.port.out.AuditEventRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link AuditEventRepositoryPort} over JPA.
 * The audit trail is append-only; this adapter only reads recent events.
 */
@Component
@RequiredArgsConstructor
public class AuditEventJpaAdapter implements AuditEventRepositoryPort {

    private final AuditEventJpaRepository jpa;

    @Override
    public List<AuditEvent> listar(UUID org, String resourceType, int limit) {
        List<AuditEventEntity> rows = (resourceType == null || resourceType.isBlank())
                ? jpa.findTop50ByOrganizationIdOrderByOccurredAtDesc(org)
                : jpa.findTop50ByOrganizationIdAndResourceTypeOrderByOccurredAtDesc(org, resourceType);
        return rows.stream().limit(limit).map(this::toDomain).toList();
    }

    private AuditEvent toDomain(AuditEventEntity entity) {
        return new AuditEvent(
                entity.getId(),
                entity.getOrganizationId(),
                entity.getActorId(),
                entity.getAction(),
                entity.getResourceType(),
                entity.getResourceId(),
                entity.getOccurredAt());
    }
}
