package com.eip.modules.cms.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.cms.domain.model.AppNotification;

/**
 * Hand-written mapper between the {@link AppNotification} aggregate and its
 * entity.
 */
@Component
public class AppNotificationMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public AppNotificationEntity toEntity(AppNotification domain, AppNotificationEntity existing) {
        boolean isNew = existing == null;
        AppNotificationEntity entity = isNew ? new AppNotificationEntity() : existing;
        if (isNew) {
            entity.setId(domain.id());
            entity.setCreatedAt(OffsetDateTime.now());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setUserId(domain.userId());
        entity.setType(domain.type());
        entity.setTitle(domain.title());
        entity.setBody(domain.body());
        entity.setRead(domain.read());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public AppNotification toDomain(AppNotificationEntity entity) {
        return new AppNotification(
                entity.getId(),
                entity.getOrganizationId(),
                entity.getUserId(),
                entity.getType(),
                entity.getTitle(),
                entity.getBody(),
                entity.isRead());
    }
}
