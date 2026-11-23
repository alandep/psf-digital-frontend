package com.eip.modules.subscription.adapter.out.persistence;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JPA entity mapping for the tenant-scoped {@code subscription} table.
 */
@Entity
@Table(name = "subscription")
@Getter
@Setter
@NoArgsConstructor
public class SubscriptionEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "plan_code", nullable = false)
    private String planCode;

    @Column(name = "plan_name", nullable = false)
    private String planName;

    @Column(name = "billing_interval", nullable = false)
    private String billingInterval;

    @Column(name = "amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "current_period_start")
    private OffsetDateTime currentPeriodStart;

    @Column(name = "current_period_end")
    private OffsetDateTime currentPeriodEnd;

    @Column(name = "trial_end")
    private OffsetDateTime trialEnd;

    @Column(name = "cancel_at_period_end", nullable = false)
    private boolean cancelAtPeriodEnd;

    @Column(name = "payment_brand")
    private String paymentBrand;

    @Column(name = "payment_last4")
    private String paymentLast4;

    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;

    @Column(name = "stripe_subscription_id")
    private String stripeSubscriptionId;

    @Column(name = "asaas_customer_id")
    private String asaasCustomerId;

    @Column(name = "asaas_subscription_id")
    private String asaasSubscriptionId;

    @Column(name = "billing_type")
    private String billingType;

    /** Asaas creditCardToken (never a PAN). */
    @Column(name = "card_token")
    private String cardToken;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    @Column(name = "canceled_at")
    private OffsetDateTime canceledAt;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "coupon_code")
    private String couponCode;

    @Column(name = "coupon_price", precision = 18, scale = 2)
    private BigDecimal couponPrice;

    @Column(name = "coupon_cycles_remaining")
    private Integer couponCyclesRemaining;

    @Column(name = "invoices_synced_at")
    private OffsetDateTime invoicesSyncedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
