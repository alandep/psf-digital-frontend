package com.eip.modules.subscription.adapter.out.persistence;

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
 * JPA entity mapping for the tenant-scoped {@code subscription_usage} table.
 */
@Entity
@Table(name = "subscription_usage")
@Getter
@Setter
@NoArgsConstructor
public class UsageEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "feature", nullable = false)
    private String feature;

    @Column(name = "label")
    private String label;

    @Column(name = "used", precision = 18, scale = 2, nullable = false)
    private BigDecimal used;

    @Column(name = "included", precision = 18, scale = 2, nullable = false)
    private BigDecimal included;

    @Column(name = "unit")
    private String unit;

    @Column(name = "period")
    private String period;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
