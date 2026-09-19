package com.eip.modules.cms.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.cms.domain.model.OfficialLink;

/**
 * Hand-written mapper between the {@link OfficialLink} record and its entity.
 */
@Component
public class OfficialLinkMapper {

    /**
     * Maps a domain record to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public OfficialLinkEntity toEntity(OfficialLink domain, OfficialLinkEntity existing) {
        boolean isNew = existing == null;
        OfficialLinkEntity entity = isNew ? new OfficialLinkEntity() : existing;
        if (isNew) {
            entity.setId(domain.id());
            entity.setCreatedAt(OffsetDateTime.now());
        }
        entity.setCategory(domain.category());
        entity.setName(domain.name());
        entity.setDescription(domain.description());
        entity.setUrl(domain.url());
        entity.setCountry(domain.country());
        entity.setDisplayOrder(domain.displayOrder());
        entity.setActive(domain.active());
        return entity;
    }

    /** Maps a persisted entity back to the domain record. */
    public OfficialLink toDomain(OfficialLinkEntity entity) {
        return new OfficialLink(
                entity.getId(),
                entity.getCategory(),
                entity.getName(),
                entity.getDescription(),
                entity.getUrl(),
                entity.getCountry(),
                entity.getDisplayOrder(),
                entity.isActive());
    }
}
