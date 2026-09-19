package com.eip.modules.ai.adapter.out.persistence;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * READ MODEL over the shared {@code subscription_usage} table.
 *
 * <p>The AI module needs to check the tenant's AI/OCR franquia before running
 * an operation. Rather than importing the Subscription module (which would
 * couple the modules and break Modulith verify), the AI module owns this small
 * read-only entity mapped at the same physical table. In this monolith the DB
 * is shared, so a local read model is a pragmatic, decoupled boundary. This can
 * later be extracted to a real cross-module API or event without touching the
 * AI application/domain code (only this adapter).
 */
@Entity
@Table(name = "subscription_usage")
@Getter
@Setter
@NoArgsConstructor
public class SubscriptionUsageReadEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "feature", nullable = false)
    private String feature;

    @Column(name = "label")
    private String label;

    @Column(name = "used", precision = 18, scale = 2)
    private BigDecimal used;

    @Column(name = "included", precision = 18, scale = 2)
    private BigDecimal included;

    @Column(name = "unit")
    private String unit;
}
