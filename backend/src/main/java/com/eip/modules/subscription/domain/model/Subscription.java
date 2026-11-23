package com.eip.modules.subscription.domain.model;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Subscription aggregate root. Pure domain — no Spring, JPA or persistence
 * concerns. Encapsulates the plan/billing state of an organization and the
 * transitions driven by the billing screens and the payment gateway webhooks.
 *
 * <p>{@code amount} is always the full plan price for the billing interval; when
 * a coupon is active the gateway charges {@link #chargeAmount()} instead.
 */
public class Subscription {

    /** Grace window after an expired trial for orgs already linked to the gateway. */
    public static final Duration LINKED_TRIAL_GRACE = Duration.ofDays(3);

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

    private String asaasCustomerId;
    private String asaasSubscriptionId;
    private String billingType;
    private String cardToken;
    private LocalDate nextDueDate;
    private OffsetDateTime canceledAt;
    private String cancelReason;
    private String couponCode;
    private BigDecimal couponPrice;
    private Integer couponCyclesRemaining;
    private OffsetDateTime invoicesSyncedAt;

    public Subscription(SubscriptionId id, UUID organizationId, PlanCode planCode,
            String planName, BillingInterval billingInterval, BigDecimal amount,
            SubscriptionStatus status, OffsetDateTime currentPeriodStart,
            OffsetDateTime currentPeriodEnd, OffsetDateTime trialEnd,
            boolean cancelAtPeriodEnd, String paymentBrand, String paymentLast4,
            long version, BillingDetails billing) {
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
        BillingDetails b = billing != null ? billing : BillingDetails.empty();
        this.asaasCustomerId = b.asaasCustomerId();
        this.asaasSubscriptionId = b.asaasSubscriptionId();
        this.billingType = b.billingType();
        this.cardToken = b.cardToken();
        this.nextDueDate = b.nextDueDate();
        this.canceledAt = b.canceledAt();
        this.cancelReason = b.cancelReason();
        this.couponCode = b.couponCode();
        this.couponPrice = b.couponPrice();
        this.couponCyclesRemaining = b.couponCyclesRemaining();
        this.invoicesSyncedAt = b.invoicesSyncedAt();
    }

    // ------------------------------------------------------------------ transitions

    /**
     * Switches the subscription to a new plan / interval. The status is kept (a
     * trial stays a trial). Not allowed once canceled or terminated.
     */
    public void changePlan(PlanCode newCode, String newName, BillingInterval interval,
            BigDecimal newAmount) {
        if (status == SubscriptionStatus.CANCELED || status == SubscriptionStatus.TERMINATED) {
            throw new BusinessRuleException(
                    "Não é possível alterar o plano de uma assinatura cancelada ou encerrada.");
        }
        this.planCode = newCode;
        this.planName = newName;
        this.billingInterval = interval;
        this.amount = newAmount;
    }

    /** Records the gateway customer id. */
    public void linkCustomer(String customerId) {
        this.asaasCustomerId = customerId;
    }

    /** Links the subscription to a freshly created gateway subscription. */
    public void linkGateway(String customerId, String subscriptionId, String billingType,
            String cardToken, String brand, String last4, LocalDate nextDueDate) {
        this.asaasCustomerId = customerId;
        this.asaasSubscriptionId = subscriptionId;
        this.nextDueDate = nextDueDate;
        updatePaymentMethod(billingType, cardToken, brand, last4);
    }

    /** Updates the payment method; card fields are cleared for PIX/BOLETO. */
    public void updatePaymentMethod(String billingType, String cardToken, String brand,
            String last4) {
        this.billingType = billingType;
        if ("CREDIT_CARD".equals(billingType)) {
            this.cardToken = cardToken != null ? cardToken : this.cardToken;
            this.paymentBrand = brand != null ? brand : this.paymentBrand;
            this.paymentLast4 = last4 != null ? last4 : this.paymentLast4;
        } else {
            this.cardToken = null;
            this.paymentBrand = null;
            this.paymentLast4 = null;
        }
    }

    /** Applies a fixed-price coupon for a number of charges. */
    public void applyCoupon(String code, BigDecimal price, int cycles) {
        this.couponCode = code;
        this.couponPrice = price;
        this.couponCyclesRemaining = cycles;
    }

    /** Removes the coupon (full price from the next charge on). */
    public void clearCoupon() {
        this.couponCode = null;
        this.couponPrice = null;
        this.couponCyclesRemaining = null;
    }

    /**
     * Consumes one discounted charge.
     *
     * @return {@code true} when this was the last discounted charge (the caller
     *         must switch the gateway back to the full price and clear the coupon)
     */
    public boolean consumeCouponCycle() {
        if (!hasCoupon()) {
            return false;
        }
        int remaining = Math.max(0, couponCyclesRemaining - 1);
        this.couponCyclesRemaining = remaining;
        return remaining == 0;
    }

    /**
     * Starts a paid billing period (payment confirmed by the gateway).
     *
     * @return {@code false} when this exact period was already applied (idempotent)
     */
    public boolean startPaidPeriod(OffsetDateTime start, OffsetDateTime end) {
        boolean alreadyApplied = status == SubscriptionStatus.ACTIVE
                && currentPeriodStart != null && start != null
                && currentPeriodStart.toInstant().equals(start.toInstant());
        if (status != SubscriptionStatus.CANCELED && status != SubscriptionStatus.TERMINATED) {
            this.status = SubscriptionStatus.ACTIVE;
        }
        this.currentPeriodStart = start;
        this.currentPeriodEnd = end;
        if (gatewayLinked() && end != null) {
            this.nextDueDate = end.atZoneSameInstant(BillingRules.ZONE).toLocalDate();
        }
        return !alreadyApplied;
    }

    /** Cancels: the gateway subscription is removed and access lasts until period end. */
    public void cancel(String reason, OffsetDateTime now) {
        if (status == SubscriptionStatus.CANCELED || status == SubscriptionStatus.TERMINATED) {
            throw new BusinessRuleException("A assinatura já está cancelada.");
        }
        if (currentPeriodEnd == null) {
            this.currentPeriodEnd = trialEnd != null ? trialEnd : now;
        }
        this.status = SubscriptionStatus.CANCELED;
        this.cancelAtPeriodEnd = true;
        this.canceledAt = now;
        this.cancelReason = reason;
        this.asaasSubscriptionId = null;
        this.nextDueDate = null;
    }

    /** Whether {@link #reactivate} is allowed at {@code now}. */
    public boolean canReactivate(OffsetDateTime now) {
        return status == SubscriptionStatus.CANCELED && currentPeriodEnd != null
                && currentPeriodEnd.isAfter(now);
    }

    /** Re-activates a canceled subscription linked to a new gateway subscription. */
    public void reactivate(String newGatewaySubscriptionId, LocalDate nextDueDate,
            OffsetDateTime now) {
        if (!canReactivate(now)) {
            throw new BusinessRuleException(
                    "Só é possível reativar uma assinatura cancelada dentro do período vigente.");
        }
        this.status = trialEnd != null && trialEnd.isAfter(now)
                ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE;
        this.cancelAtPeriodEnd = false;
        this.canceledAt = null;
        this.cancelReason = null;
        this.asaasSubscriptionId = newGatewaySubscriptionId;
        this.nextDueDate = nextDueDate;
    }

    /** Webhook transition: a payment is overdue. */
    public void markPastDue() {
        if (status != SubscriptionStatus.CANCELED && status != SubscriptionStatus.TERMINATED) {
            this.status = SubscriptionStatus.PAST_DUE;
        }
    }

    /** Webhook transition: payment succeeded. */
    public void markActive() {
        this.status = SubscriptionStatus.ACTIVE;
    }

    public void markInvoicesSynced(OffsetDateTime now) {
        this.invoicesSyncedAt = now;
    }

    /** Whether the invoices must be re-synced with the gateway. */
    public boolean invoicesSyncDue(OffsetDateTime now, Duration maxAge) {
        return gatewayLinked()
                && (invoicesSyncedAt == null || invoicesSyncedAt.plus(maxAge).isBefore(now));
    }

    // ------------------------------------------------------------------ derived

    public boolean gatewayLinked() {
        return asaasSubscriptionId != null && !asaasSubscriptionId.isBlank();
    }

    public boolean hasCoupon() {
        return couponCode != null && couponPrice != null && couponCyclesRemaining != null
                && couponCyclesRemaining > 0;
    }

    /** Amount charged per cycle by the gateway (coupon price while it lasts). */
    public BigDecimal chargeAmount() {
        return hasCoupon() ? couponPrice : amount;
    }

    /** License mode at {@code now} (see contract section 5). */
    public LicenseMode licenseMode(OffsetDateTime now) {
        return licenseModeOf(status, trialEnd, currentPeriodEnd, gatewayLinked(), now);
    }

    /** License mode right now. */
    public LicenseMode licenseMode() {
        return licenseMode(OffsetDateTime.now());
    }

    /**
     * Pure license rule shared by the aggregate and its tests.
     */
    public static LicenseMode licenseModeOf(SubscriptionStatus status, OffsetDateTime trialEnd,
            OffsetDateTime periodEnd, boolean gatewayLinked, OffsetDateTime now) {
        if (status == null) {
            return LicenseMode.FULL;
        }
        return switch (status) {
            case ACTIVE -> LicenseMode.FULL;
            case TRIALING -> {
                OffsetDateTime end = trialEnd != null ? trialEnd : periodEnd;
                if (end == null || end.isAfter(now)) {
                    yield LicenseMode.FULL;
                }
                if (gatewayLinked) {
                    yield end.plus(LINKED_TRIAL_GRACE).isAfter(now)
                            ? LicenseMode.FULL : LicenseMode.READ_ONLY;
                }
                yield LicenseMode.BILLING_ONLY;
            }
            case PAST_DUE, GRACE_PERIOD -> LicenseMode.READ_ONLY;
            case SUSPENDED -> LicenseMode.BILLING_ONLY;
            case CANCELED -> periodEnd != null && periodEnd.isAfter(now)
                    ? LicenseMode.FULL : LicenseMode.READ_ONLY;
            case TERMINATED -> LicenseMode.NONE;
        };
    }

    /** Snapshot of the billing attributes (for persistence). */
    public BillingDetails billingDetails() {
        return new BillingDetails(asaasCustomerId, asaasSubscriptionId, billingType, cardToken,
                nextDueDate, canceledAt, cancelReason, couponCode, couponPrice,
                couponCyclesRemaining, invoicesSyncedAt);
    }

    // ------------------------------------------------------------------ accessors

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

    public String asaasCustomerId() {
        return asaasCustomerId;
    }

    public String asaasSubscriptionId() {
        return asaasSubscriptionId;
    }

    public String billingType() {
        return billingType;
    }

    public String cardToken() {
        return cardToken;
    }

    public LocalDate nextDueDate() {
        return nextDueDate;
    }

    public OffsetDateTime canceledAt() {
        return canceledAt;
    }

    public String cancelReason() {
        return cancelReason;
    }

    public String couponCode() {
        return couponCode;
    }

    public BigDecimal couponPrice() {
        return couponPrice;
    }

    public Integer couponCyclesRemaining() {
        return couponCyclesRemaining;
    }

    public OffsetDateTime invoicesSyncedAt() {
        return invoicesSyncedAt;
    }
}
