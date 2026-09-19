package com.eip.modules.intelligence.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.intelligence.domain.model.WatchTargetType;
import com.eip.modules.intelligence.domain.model.WatchlistItem;

/**
 * Hand-written mapper between the watchlist aggregate and its JPA entity.
 */
@Component
public class WatchlistItemMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public WatchlistItemEntity toEntity(WatchlistItem domain, WatchlistItemEntity existing) {
        boolean isNew = existing == null;
        WatchlistItemEntity entity = isNew ? new WatchlistItemEntity() : existing;
        if (isNew) {
            entity.setId(domain.id());
            entity.setCreatedAt(OffsetDateTime.now());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setUserId(domain.userId());
        entity.setType(domain.type() == null ? null : domain.type().name());
        entity.setLabel(domain.label());
        entity.setActive(domain.active());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public WatchlistItem toDomain(WatchlistItemEntity entity) {
        return new WatchlistItem(
                entity.getId(),
                entity.getOrganizationId(),
                entity.getUserId(),
                entity.getType() == null ? null : WatchTargetType.valueOf(entity.getType()),
                entity.getLabel(),
                entity.isActive());
    }
}
