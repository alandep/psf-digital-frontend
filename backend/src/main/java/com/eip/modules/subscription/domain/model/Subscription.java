package com.eip.modules.subscription.domain.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Subscription aggregate root. Pure domain — no Spring, JPA or persistence
 * concerns. Encapsulates the plan/billing state of an organization and the
 * transitions the front-end billing screens and Stripe webhooks drive.
 */
public class Subscription {

    private final SubscriptionId id;
    private final UUID organizationId;
    private PlanCode planCode;
    private String planName;
    private BillingInterval billingInterval;
    private BigDecimal amount;
    private SubscriptionStatus status;
    private OffsetDateTime currentPeriodStart;
    private OffsetDateTime currentPeriodEnd;
    private OffsetDateTime trialEnd;
    private boolean cancelAtPeriodEnd;
    private String paymentBrand;
    private String paymentLast4;
    private long version;

    public Subscription(SubscriptionId id, UUID organizationId, PlanCode planCode,
            String planName, BillingInterval billingInterval, BigDecimal amount,
            SubscriptionStatus status, OffsetDateTime currentPeriodStart,
            OffsetDateTime currentPeriodEnd, OffsetDateTime trialEnd,
            boolean cancelAtPeriodEnd, String paymentBrand, String paymentLast4,
            long version) {
        this.id = id;
        this.organizationId = organizationId;
        this.planCode = planCode;
        this.planName = planName;
        this.billingInterval = billingInterval;
        this.amount = amount;
        this.status = status;
        this.currentPeriodStart = currentPeriodStart;
        this.currentPeriodEnd = currentPeriodEnd;
        this.trialEnd = trialEnd;
        this.cancelAtPeriodEnd = cancelAtPeriodEnd;
        this.paymentBrand = paymentBrand;
        this.paymentLast4 = paymentLast4;
        this.version = version;
    }

    /**
     * Switches the subscription to a new plan. Not allowed once the
     * subscription has been canceled or terminated.
     */
    public void changePlan(PlanCode newCode, String newName, BigDecimal newAmount) {
        if (status == SubscriptionStatus.CANCELED || status == SubscriptionStatus.TERMINATED) {
            throw new BusinessRuleException(
                    "Nao e possivel alterar o plano de uma assinatura encerrada");
        }
        this.planCode = newCode;
        this.planName = newName;
        this.amount = newAmount;
        this.status = SubscriptionStatus.ACTIVE;
    }

    /** Schedules cancellation at period end and flags the subscription canceled. */
    public void cancel() {
        this.cancelAtPeriodEnd = true;
        this.status = SubscriptionStatus.CANCELED;
    }

    /** Re-activates a previously canceled subscription. */
    public void reactivate() {
        this.status = SubscriptionStatus.ACTIVE;
        this.cancelAtPeriodEnd = false;
    }

    /** Webhook transition: a payment failed. */
    public void markPastDue() {
        this.status = SubscriptionStatus.PAST_DUE;
    }

    /** Webhook transition: payment succeeded / checkout completed. */
    public void markActive() {
        this.status = SubscriptionStatus.ACTIVE;
    }

    /** Moves the subscription into the trial state (used by mock checkout). */
    public void startTrial(OffsetDateTime trialEnd) {
        this.status = SubscriptionStatus.TRIALING;
        this.trialEnd = trialEnd;
    }

    /**
     * Derives the license mode from the current status.
     */
    public LicenseMode licenseMode() {
        return switch (status) {
            case ACTIVE, TRIALING -> LicenseMode.FULL;
            case PAST_DUE, GRACE_PERIOD -> LicenseMode.READ_ONLY;
            case SUSPENDED -> LicenseMode.BILLING_ONLY;
            case CANCELED, TERMINATED -> LicenseMode.NONE;
        };
    }

    public SubscriptionId id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public PlanCode planCode() {
        return planCode;
    }

    public String planName() {
        return planName;
    }

    public BillingInterval billingInterval() {
        return billingInterval;
    }

    public BigDecimal amount() {
        return amount;
    }

    public SubscriptionStatus status() {
        return status;
    }

    public OffsetDateTime currentPeriodStart() {
        return currentPeriodStart;
    }

    public OffsetDateTime currentPeriodEnd() {
        return currentPeriodEnd;
    }

    public OffsetDateTime trialEnd() {
        return trialEnd;
    }

    public boolean cancelAtPeriodEnd() {
        return cancelAtPeriodEnd;
    }

    public String paymentBrand() {
        return paymentBrand;
    }

    public String paymentLast4() {
        return paymentLast4;
    }

    public long version() {
        return version;
    }
}
