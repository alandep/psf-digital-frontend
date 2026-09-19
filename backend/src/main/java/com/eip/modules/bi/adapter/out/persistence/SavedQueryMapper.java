package com.eip.modules.bi.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.bi.domain.model.SavedQuery;
import com.eip.modules.bi.domain.model.SavedQueryId;

/**
 * Hand-written mapper between the saved-query aggregate and its JPA entity.
 */
@Component
public class SavedQueryMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public SavedQueryEntity toEntity(SavedQuery domain, SavedQueryEntity existing) {
        boolean isNew = existing == null;
        SavedQueryEntity entity = isNew ? new SavedQueryEntity() : existing;
        if (isNew) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setUserId(domain.userId());
        entity.setName(domain.name());
        entity.setDataset(domain.dataset());
        entity.setQueryJson(domain.queryJson());
        entity.setUpdatedAt(OffsetDateTime.now());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public SavedQuery toDomain(SavedQueryEntity entity) {
        return new SavedQuery(
                SavedQueryId.of(entity.getId()),
                entity.getOrganizationId(),
                entity.getUserId(),
                entity.getName(),
                entity.getDataset(),
                entity.getQueryJson());
    }
}
