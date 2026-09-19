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
 * JPA entity mapping for the {@code intelligence_alert} table (V13). Tenant-scoped.
 */
@Entity
@Table(name = "intelligence_alert")
@Getter
@Setter
@NoArgsConstructor
public class IntelligenceAlertEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false)
    private String title;

    @Column(name = "impact_level")
    private String impactLevel;

    @Column(name = "related_to")
    private String relatedTo;

    @Column(name = "affected_operations", nullable = false)
    private int affectedOperations;

    private String summary;

    @Column(nullable = false)
    private boolean read;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
