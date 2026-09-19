package com.eip.modules.crm.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.crm.domain.model.Lead;
import com.eip.modules.crm.domain.model.LeadId;
import com.eip.modules.crm.domain.model.LeadSource;
import com.eip.modules.crm.domain.model.LeadStatus;

/**
 * Hand-written mapper between the lead aggregate and its JPA entity.
 */
@Component
public class LeadMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public LeadEntity toEntity(Lead domain, LeadEntity existing) {
        boolean isNew = existing == null;
        LeadEntity entity = isNew ? new LeadEntity() : existing;
        if (isNew) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setVersion(domain.version());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setName(domain.name());
        entity.setCompanyName(domain.companyName());
        entity.setEmail(domain.email());
        entity.setPhone(domain.phone());
        entity.setSource(domain.source() == null ? null : domain.source().name());
        entity.setOrigin(domain.origin());
        entity.setStatus(domain.status().name());
        entity.setUpdatedAt(OffsetDateTime.now());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public Lead toDomain(LeadEntity entity) {
        return new Lead(
                LeadId.of(entity.getId()),
                entity.getOrganizationId(),
                entity.getName(),
                entity.getCompanyName(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getSource() == null ? null : LeadSource.valueOf(entity.getSource()),
                entity.getOrigin(),
                LeadStatus.valueOf(entity.getStatus()),
                entity.getVersion());
    }
}
