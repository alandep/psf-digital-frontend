package com.eip.modules.intelligence.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.intelligence.domain.model.IntelligenceItem;

/**
 * Outbound port: persistence for the GLOBAL curated intelligence item aggregate.
 */
public interface IntelligenceItemRepositoryPort {

    /** Public feed: only PUBLISHED + APPROVED items, optionally filtered by type. */
    List<IntelligenceItem> feed(String type);

    Optional<IntelligenceItem> bySlug(String slug);

    Optional<IntelligenceItem> byId(UUID id);

    IntelligenceItem salvar(IntelligenceItem i);

    /** CMS listing, optionally filtered by review status. */
    List<IntelligenceItem> listarCms(String reviewStatus);

    long countByReviewStatus(String reviewStatus);

    long countByPublicationStatus(String publicationStatus);

    long countAiGenerated();

    long countTotal();
}
