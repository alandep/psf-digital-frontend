package com.eip.modules.subscription.adapter.out.persistence;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JPA entity mapping for the global {@code plan} catalog (no RLS).
 */
@Entity
@Table(name = "plan")
@Getter
@Setter
@NoArgsConstructor
public class PlanEntity {

    @Id
    @Column(name = "code")
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "monthly_price", precision = 18, scale = 2, nullable = false)
    private BigDecimal monthlyPrice;

    @Column(name = "annual_price", precision = 18, scale = 2, nullable = false)
    private BigDecimal annualPrice;

    @Column(name = "highlighted", nullable = false)
    private boolean highlighted;

    @Column(name = "active", nullable = false)
    private boolean active;
}
