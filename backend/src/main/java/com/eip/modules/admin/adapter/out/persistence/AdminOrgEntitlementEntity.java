package com.eip.modules.admin.adapter.out.persistence;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Admin-module view of the tenant-scoped {@code organization_entitlement} snapshot. */
@Entity(name = "AdminOrgEntitlement")
@Table(name = "organization_entitlement")
@IdClass(AdminOrgEntitlementId.class)
@Getter
@Setter
@NoArgsConstructor
public class AdminOrgEntitlementEntity {

    @Id
    @Column(name = "organization_id")
    private UUID organizationId;

    @Id
    @Column(name = "feature_key")
    private String featureKey;

    private boolean enabled;

    @Column(name = "limit_value")
    private BigDecimal limitValue;

    @Column(name = "applied_plan")
    private String appliedPlan;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}