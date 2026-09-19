package com.eip.modules.intelligence.domain.model;

import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Curated intelligence item aggregate. GLOBAL content (not tenant-scoped). Pure
 * domain — no Spring/JPA. Exposes CMS lifecycle transitions guarded by business
 * rules; the AI analysis is kept separate from the human-authored summary.
 */
public final class IntelligenceItem {

    private final UUID id;
    private final IntelligenceType type;
    private final String title;
    private final String slug;
    private final String summary;
    private final String content;
    private final String sourceName;
    private final String country;
    private final String sector;
    private final String commodity;
    private final ImpactLevel impactLevel;
    private final boolean aiGenerated;
    private final String aiAnalysis;
    private ReviewStatus reviewStatus;
    private PublicationStatus publicationStatus;

    public IntelligenceItem(UUID id, IntelligenceType type, String title, String slug,
                            String summary, String content, String sourceName, String country,
                            String sector, String commodity, ImpactLevel impactLevel,
                            boolean aiGenerated, String aiAnalysis, ReviewStatus reviewStatus,
                            PublicationStatus publicationStatus) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.slug = slug;
        this.summary = summary;
        this.content = content;
        this.sourceName = sourceName;
        this.country = country;
        this.sector = sector;
        this.commodity = commodity;
        this.impactLevel = impactLevel;
        this.aiGenerated = aiGenerated;
        this.aiAnalysis = aiAnalysis;
        this.reviewStatus = reviewStatus;
        this.publicationStatus = publicationStatus;
    }

    /** Creates a new curated item in DRAFT review / SCHEDULED publication. */
    public static IntelligenceItem novo(IntelligenceType type, String title, String slug,
                                        String summary, String content, String sourceName,
                                        String country, String sector, String commodity,
                                        ImpactLevel impactLevel, boolean aiGenerated,
                                        String aiAnalysis) {
        if (title == null || title.isBlank()) {
            throw new BusinessRuleException("Titulo do item de inteligencia e obrigatorio");
        }
        if (type == null) {
            throw new BusinessRuleException("Tipo do item de inteligencia e obrigatorio");
        }
        return new IntelligenceItem(
                UUID.randomUUID(), type, title, slug, summary, content, sourceName, country,
                sector, commodity, impactLevel, aiGenerated, aiAnalysis,
                ReviewStatus.REVIEW_REQUIRED, PublicationStatus.SCHEDULED);
    }

    /** Approves the item (review REQUIRED/DRAFT -> APPROVED). */
    public void aprovar() {
        if (reviewStatus == ReviewStatus.REJECTED) {
            throw new BusinessRuleException("Item rejeitado nao pode ser aprovado");
        }
        this.reviewStatus = ReviewStatus.APPROVED;
    }

    /** Rejects the item (-> REJECTED). */
    public void rejeitar() {
        this.reviewStatus = ReviewStatus.REJECTED;
    }

    /**
     * Publishes the item.
     *
     * @throws BusinessRuleException if the item is not APPROVED
     */
    public void publicar() {
        if (reviewStatus != ReviewStatus.APPROVED) {
            throw new BusinessRuleException("Somente itens APPROVED podem ser publicados");
        }
        this.publicationStatus = PublicationStatus.PUBLISHED;
    }

    /** Archives the item (-> ARCHIVED). */
    public void arquivar() {
        this.publicationStatus = PublicationStatus.ARCHIVED;
    }

    public UUID id() {
        return id;
    }

    public IntelligenceType type() {
        return type;
    }

    public String title() {
        return title;
    }

    public String slug() {
        return slug;
    }

    public String summary() {
        return summary;
    }

    public String content() {
        return content;
    }

    public String sourceName() {
        return sourceName;
    }

    public String country() {
        return country;
    }

    public String sector() {
        return sector;
    }

    public String commodity() {
        return commodity;
    }

    public ImpactLevel impactLevel() {
        return impactLevel;
    }

    public boolean aiGenerated() {
        return aiGenerated;
    }

    public String aiAnalysis() {
        return aiAnalysis;
    }

    public ReviewStatus reviewStatus() {
        return reviewStatus;
    }

    public PublicationStatus publicationStatus() {
        return publicationStatus;
    }
}
