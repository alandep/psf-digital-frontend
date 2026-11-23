package com.eip.modules.subscription.adapter.out.persistence;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JPA entity for the global {@code coupon} catalog (no RLS).
 */
@Entity(name = "BillingCoupon")
@Table(name = "coupon")
@Getter
@Setter
@NoArgsConstructor
public class CouponEntity {

    @Id
    @Column(name = "code")
    private String code;

    @Column(name = "description")
    private String description;

    @Column(name = "plan_code")
    private String planCode;

    @Column(name = "billing_interval")
    private String billingInterval;

    @Column(name = "fixed_price", precision = 18, scale = 2, nullable = false)
    private BigDecimal fixedPrice;

    @Column(name = "cycles", nullable = false)
    private int cycles;

    @Column(name = "max_redemptions")
    private Integer maxRedemptions;

    @Column(name = "redeemed", nullable = false)
    private int redeemed;

    @Column(name = "valid_until")
    private OffsetDateTime validUntil;

    @Column(name = "active", nullable = false)
    private boolean active;
}
