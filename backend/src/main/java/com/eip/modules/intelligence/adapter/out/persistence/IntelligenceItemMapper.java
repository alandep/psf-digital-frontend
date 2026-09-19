package com.eip.modules.intelligence.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.intelligence.domain.model.ImpactLevel;
import com.eip.modules.intelligence.domain.model.IntelligenceItem;
import com.eip.modules.intelligence.domain.model.IntelligenceType;
import com.eip.modules.intelligence.domain.model.PublicationStatus;
import com.eip.modules.intelligence.domain.model.ReviewStatus;

/**
 * Hand-written mapper between the curated item aggregate and its JPA entity.
 */
@Component
public class IntelligenceItemMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public IntelligenceItemEntity toEntity(IntelligenceItem domain, IntelligenceItemEntity existing) {
        boolean isNew = existing == null;
        IntelligenceItemEntity entity = isNew ? new IntelligenceItemEntity() : existing;
        OffsetDateTime now = OffsetDateTime.now();
        if (isNew) {
            entity.setId(domain.id());
            entity.setCreatedAt(now);
        }
        entity.setUpdatedAt(now);
        entity.setType(domain.type() == null ? null : domain.type().name());
        entity.setTitle(domain.title());
        entity.setSlug(domain.slug());
        entity.setSummary(domain.summary());
        entity.setContent(domain.content());
        entity.setSourceName(domain.sourceName());
        entity.setCountry(domain.country());
        entity.setSector(domain.sector());
        entity.setCommodity(domain.commodity());
        entity.setImpactLevel(domain.impactLevel() == null ? null : domain.impactLevel().name());
        entity.setAiGenerated(domain.aiGenerated());
        entity.setAiAnalysis(domain.aiAnalysis());
        entity.setReviewStatus(domain.reviewStatus() == null ? null : domain.reviewStatus().name());
        entity.setPublicationStatus(
                domain.publicationStatus() == null ? null : domain.publicationStatus().name());
        if (domain.publicationStatus() == PublicationStatus.PUBLISHED && entity.getPublishedAt() == null) {
            entity.setPublishedAt(now);
        }
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public IntelligenceItem toDomain(IntelligenceItemEntity entity) {
        return new IntelligenceItem(
                entity.getId(),
                entity.getType() == null ? null : IntelligenceType.valueOf(entity.getType()),
                entity.getTitle(),
                entity.getSlug(),
                entity.getSummary(),
                entity.getContent(),
                entity.getSourceName(),
                entity.getCountry(),
                entity.getSector(),
                entity.getCommodity(),
                entity.getImpactLevel() == null ? null : ImpactLevel.valueOf(entity.getImpactLevel()),
                entity.isAiGenerated(),
                entity.getAiAnalysis(),
                entity.getReviewStatus() == null ? null : ReviewStatus.valueOf(entity.getReviewStatus()),
                entity.getPublicationStatus() == null
                        ? null : PublicationStatus.valueOf(entity.getPublicationStatus()));
    }
}
