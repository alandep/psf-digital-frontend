package com.eip.modules.compliance.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.compliance.domain.model.RiskLevel;
import com.eip.modules.compliance.domain.model.Screening;
import com.eip.modules.compliance.domain.model.ScreeningId;
import com.eip.modules.compliance.domain.model.ScreeningStatus;

/**
 * Hand-written mapper between the screening aggregate and its JPA entity.
 */
@Component
public class ScreeningMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public ScreeningEntity toEntity(Screening domain, ScreeningEntity existing) {
        boolean isNew = existing == null;
        ScreeningEntity entity = isNew ? new ScreeningEntity() : existing;
        if (isNew) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setVersion(domain.version());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setEntityName(domain.entityName());
        entity.setEntityType(domain.entityType());
        entity.setDocument(domain.document());
        entity.setStatus(domain.status().name());
        entity.setRiskLevel(domain.riskLevel() == null ? null : domain.riskLevel().name());
        entity.setListsChecked(domain.listsChecked());
        entity.setResultSummary(domain.resultSummary());
        entity.setUpdatedAt(OffsetDateTime.now());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public Screening toDomain(ScreeningEntity entity) {
        return new Screening(
                ScreeningId.of(entity.getId()),
                entity.getOrganizationId(),
                entity.getEntityName(),
                entity.getEntityType(),
                entity.getDocument(),
                ScreeningStatus.valueOf(entity.getStatus()),
                entity.getRiskLevel() == null ? null : RiskLevel.valueOf(entity.getRiskLevel()),
                entity.getListsChecked(),
                entity.getResultSummary(),
                entity.getVersion());
    }
}
