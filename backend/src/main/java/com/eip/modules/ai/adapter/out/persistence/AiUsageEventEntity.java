package com.eip.modules.ai.adapter.out.persistence;

import java.math.BigDecimal;
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
 * JPA entity mapping the tenant-scoped {@code ai_usage_event} ledger table
 * (RLS-protected by {@code organization_id}).
 */
@Entity
@Table(name = "ai_usage_event")
@Getter
@Setter
@NoArgsConstructor
public class AiUsageEventEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "operation", nullable = false)
    private String operation;

    @Column(name = "provider")
    private String provider;

    @Column(name = "model")
    private String model;

    @Column(name = "input_units", nullable = false)
    private long inputUnits;

    @Column(name = "output_units", nullable = false)
    private long outputUnits;

    @Column(name = "ocr_pages", nullable = false)
    private int ocrPages;

    @Column(name = "provider_cost", precision = 18, scale = 6)
    private BigDecimal providerCost;

    @Column(name = "eip_credits", precision = 18, scale = 2)
    private BigDecimal eipCredits;

    @Column(name = "request_id")
    private String requestId;

    @Column(name = "idempotency_key")
    private String idempotencyKey;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
