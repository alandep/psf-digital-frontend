package com.eip.modules.cms.adapter.out.persistence;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.cms.domain.model.AdCampaign;
import com.eip.modules.cms.domain.model.AdCampaignStatus;

/**
 * Hand-written mapper between the {@link AdCampaign} aggregate and its entity.
 */
@Component
public class AdCampaignMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public AdCampaignEntity toEntity(AdCampaign domain, AdCampaignEntity existing) {
        boolean isNew = existing == null;
        AdCampaignEntity entity = isNew ? new AdCampaignEntity() : existing;
        if (isNew) {
            entity.setId(domain.id());
            entity.setCreatedAt(OffsetDateTime.now());
        }
        entity.setAdvertiserId(domain.advertiserId());
        entity.setName(domain.name());
        entity.setPlacement(domain.placement());
        entity.setStartAt(domain.startAt());
        entity.setEndAt(domain.endAt());
        entity.setStatus(domain.status() == null ? null : domain.status().name());
        entity.setTargetUrl(domain.targetUrl());
        entity.setImpressions(domain.impressions());
        entity.setClicks(domain.clicks());
        entity.setRevenue(domain.revenue() == null ? BigDecimal.ZERO : domain.revenue());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public AdCampaign toDomain(AdCampaignEntity entity) {
        return new AdCampaign(
                entity.getId(),
                entity.getAdvertiserId(),
                entity.getName(),
                entity.getPlacement(),
                entity.getStartAt(),
                entity.getEndAt(),
                entity.getStatus() == null ? null : AdCampaignStatus.valueOf(entity.getStatus()),
                entity.getTargetUrl(),
                entity.getImpressions(),
                entity.getClicks(),
                entity.getRevenue());
    }
}
