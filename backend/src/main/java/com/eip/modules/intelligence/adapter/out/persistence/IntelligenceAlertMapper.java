package com.eip.modules.intelligence.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.intelligence.domain.model.ImpactLevel;
import com.eip.modules.intelligence.domain.model.IntelligenceAlert;

/**
 * Hand-written mapper between the alert aggregate and its JPA entity.
 */
@Component
public class IntelligenceAlertMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public IntelligenceAlertEntity toEntity(IntelligenceAlert domain, IntelligenceAlertEntity existing) {
        boolean isNew = existing == null;
        IntelligenceAlertEntity entity = isNew ? new IntelligenceAlertEntity() : existing;
        if (isNew) {
            entity.setId(domain.id());
            entity.setCreatedAt(OffsetDateTime.now());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setTitle(domain.title());
        entity.setImpactLevel(domain.impactLevel() == null ? null : domain.impactLevel().name());
        entity.setRelatedTo(domain.relatedTo());
        entity.setAffectedOperations(domain.affectedOperations());
        entity.setSummary(domain.summary());
        entity.setRead(domain.read());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public IntelligenceAlert toDomain(IntelligenceAlertEntity entity) {
        return new IntelligenceAlert(
                entity.getId(),
                entity.getOrganizationId(),
                entity.getTitle(),
                entity.getImpactLevel() == null ? null : ImpactLevel.valueOf(entity.getImpactLevel()),
                entity.getRelatedTo(),
                entity.getAffectedOperations(),
                entity.getSummary(),
                entity.isRead());
    }
}
