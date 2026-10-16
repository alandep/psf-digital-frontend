package com.eip.modules.admin.adapter.out.persistence;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Admin-module view of the global {@code plan_feature} catalog. */
@Entity(name = "AdminPlanFeature")
@Table(name = "plan_feature")
@IdClass(AdminPlanFeatureId.class)
@Getter
@Setter
@NoArgsConstructor
public class AdminPlanFeatureEntity {

    @Id
    @Column(name = "plan_code")
    private String planCode;

    @Id
    @Column(name = "feature_key")
    private String featureKey;

    private boolean enabled;

    @Column(name = "limit_value")
    private BigDecimal limitValue;
}