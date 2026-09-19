package com.eip.modules.intelligence.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JPA entity mapping for the {@code intelligence_item} table (V13). GLOBAL
 * content — no {@code organization_id} and no optimistic-lock version column.
 */
@Entity
@Table(name = "intelligence_item")
@Getter
@Setter
@NoArgsConstructor
public class IntelligenceItemEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String title;

    private String slug;

    private String summary;

    private String content;

    @Column(name = "source_name")
    private String sourceName;

    @Column(name = "source_url")
    private String sourceUrl;

    private String country;

    private String sector;

    private String commodity;

    @Column(name = "impact_level")
    private String impactLevel;

    @Column(name = "ai_generated", nullable = false)
    private boolean aiGenerated;

    @Column(name = "ai_analysis")
    private String aiAnalysis;

    @Column(name = "review_status", nullable = false)
    private String reviewStatus;

    @Column(name = "publication_status", nullable = false)
    private String publicationStatus;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
