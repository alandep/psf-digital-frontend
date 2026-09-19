package com.eip.modules.cms.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.cms.domain.model.PublicSetting;

/**
 * Hand-written mapper between the {@link PublicSetting} record and its entity.
 */
@Component
public class PublicSettingMapper {

    /**
     * Maps a domain record to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public PublicSettingEntity toEntity(PublicSetting domain, PublicSettingEntity existing) {
        PublicSettingEntity entity = existing == null ? new PublicSettingEntity() : existing;
        entity.setKey(domain.key());
        entity.setValue(domain.value());
        entity.setType(domain.type());
        entity.setUpdatedAt(OffsetDateTime.now());
        return entity;
    }

    /** Maps a persisted entity back to the domain record. */
    public PublicSetting toDomain(PublicSettingEntity entity) {
        return new PublicSetting(entity.getKey(), entity.getValue(), entity.getType());
    }
}
