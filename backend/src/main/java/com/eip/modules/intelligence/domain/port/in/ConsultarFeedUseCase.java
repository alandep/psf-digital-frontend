package com.eip.modules.intelligence.domain.port.in;

import java.util.List;
import java.util.UUID;

import com.eip.modules.intelligence.domain.model.IntelligenceItem;

/**
 * Inbound port: public curated feed. Only PUBLISHED + APPROVED items are
 * exposed. No tenant context — content is GLOBAL and reachable without auth.
 */
public interface ConsultarFeedUseCase {

    List<FeedItemView> feed(String type);

    ItemDetailView porSlug(String slug);

    /** Summary view of a feed item. */
    record FeedItemView(
            UUID id,
            String type,
            String title,
            String slug,
            String summary,
            String country,
            String sector,
            String commodity,
            String impactLevel,
            boolean aiGenerated) {

        public static FeedItemView from(IntelligenceItem i) {
            return new FeedItemView(
                    i.id(),
                    i.type() == null ? null : i.type().name(),
                    i.title(),
                    i.slug(),
                    i.summary(),
                    i.country(),
                    i.sector(),
                    i.commodity(),
                    i.impactLevel() == null ? null : i.impactLevel().name(),
                    i.aiGenerated());
        }
    }

    /** Detail view with AI analysis clearly separated from source/summary. */
    record ItemDetailView(
            UUID id,
            String type,
            String title,
            String slug,
            String conteudo,
            String fonte,
            String resumo,
            String analiseEip,
            String country,
            String sector,
            String commodity,
            String impactLevel,
            boolean aiGerado) {

        public static ItemDetailView from(IntelligenceItem i) {
            return new ItemDetailView(
                    i.id(),
                    i.type() == null ? null : i.type().name(),
                    i.title(),
                    i.slug(),
                    i.content(),
                    i.sourceName(),
                    i.summary(),
                    i.aiAnalysis(),
                    i.country(),
                    i.sector(),
                    i.commodity(),
                    i.impactLevel() == null ? null : i.impactLevel().name(),
                    i.aiGenerated());
        }
    }
}
