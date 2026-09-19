package com.eip.modules.intelligence.domain.port.in;

import java.util.List;
import java.util.UUID;

import com.eip.modules.intelligence.domain.model.IntelligenceItem;

/**
 * Inbound port: CMS curation of global intelligence content (admin).
 */
public interface CurarConteudoUseCase {

    List<CmsItemView> listar(String reviewStatus);

    CmsItemView criar(CriarItemCommand cmd);

    CmsItemView aprovar(UUID id);

    CmsItemView rejeitar(UUID id);

    CmsItemView publicar(UUID id);

    CmsItemView arquivar(UUID id);

    CmsStats stats();

    /** Command to create a curated item. */
    record CriarItemCommand(
            String type,
            String title,
            String slug,
            String summary,
            String content,
            String sourceName,
            String country,
            String sector,
            String commodity,
            String impactLevel,
            boolean aiGenerated,
            String aiAnalysis) {
    }

    /** CMS dashboard counters. */
    record CmsStats(long coletados, long analisados, long publicados, long aguardandoRevisao) {
    }

    /** CMS read view of a curated item. */
    record CmsItemView(
            UUID id,
            String type,
            String title,
            String slug,
            String summary,
            String content,
            String sourceName,
            String country,
            String sector,
            String commodity,
            String impactLevel,
            boolean aiGenerated,
            String aiAnalysis,
            String reviewStatus,
            String publicationStatus) {

        public static CmsItemView from(IntelligenceItem i) {
            return new CmsItemView(
                    i.id(),
                    i.type() == null ? null : i.type().name(),
                    i.title(),
                    i.slug(),
                    i.summary(),
                    i.content(),
                    i.sourceName(),
                    i.country(),
                    i.sector(),
                    i.commodity(),
                    i.impactLevel() == null ? null : i.impactLevel().name(),
                    i.aiGenerated(),
                    i.aiAnalysis(),
                    i.reviewStatus() == null ? null : i.reviewStatus().name(),
                    i.publicationStatus() == null ? null : i.publicationStatus().name());
        }
    }
}
