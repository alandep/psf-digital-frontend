package com.eip.modules.cms.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.cms.domain.model.AccessProfile;

/**
 * Hand-written mapper between the {@link AccessProfile} aggregate and its entity.
 */
@Component
public class AccessProfileMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public AccessProfileEntity toEntity(AccessProfile domain, AccessProfileEntity existing) {
        boolean isNew = existing == null;
        AccessProfileEntity entity = isNew ? new AccessProfileEntity() : existing;
        if (isNew) {
            entity.setId(domain.id());
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setVersion(domain.version());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setName(domain.name());
        entity.setDescription(domain.description());
        entity.setColor(domain.color());
        entity.setSystem(domain.isSystem());
        entity.setPermissions(domain.permissions());
        entity.setUpdatedAt(OffsetDateTime.now());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public AccessProfile toDomain(AccessProfileEntity entity) {
        return new AccessProfile(
                entity.getId(),
                entity.getOrganizationId(),
                entity.getName(),
                entity.getDescription(),
                entity.getColor(),
                entity.isSystem(),
                entity.getPermissions(),
                entity.getVersion());
    }
}
