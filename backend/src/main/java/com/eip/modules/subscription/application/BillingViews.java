package com.eip.modules.subscription.application;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.eip.platform.billing.UsageQuotaService;

/**
 * Read models returned by the billing BFF endpoints (JSON shapes of the billing
 * contract, section 4).
 */
public final class BillingViews {

    private BillingViews() {
    }

    public record CouponInfo(String code, BigDecimal price, Integer cyclesRemaining) {
    }

    public record SubscriptionView(UUID id, String planCode, String planName,
            String billingInterval, BigDecimal amount, String status,
            OffsetDateTime currentPeriodStart, OffsetDateTime currentPeriodEnd,
            OffsetDateTime trialEnd, LocalDate nextDueDate, boolean cancelAtPeriodEnd,
            OffsetDateTime canceledAt, String paymentMethod, String paymentBrand,
            String paymentLast4, boolean gatewayLinked, CouponInfo coupon, String licenseMode) {
    }

    /** Plan limits; null = unlimited ({@code users} is always unlimited). */
    public record PlanLimits(Long aiCredits, Long ocrPages, Long storageGb, Long users) {
    }

    public record PlanView(String code, String name, String description,
            BigDecimal monthlyPrice, BigDecimal annualPrice, boolean highlighted,
            PlanLimits limits, List<String> modules) {
    }

    public record PackView(String code, String name, String description, BigDecimal amount,
            int aiCredits, int ocrPages, boolean highlighted) {
    }

    public record CouponView(boolean valid, String code, BigDecimal price, Integer cycles,
            String message) {
    }

    public record UsageView(OffsetDateTime periodStart, OffsetDateTime periodEnd,
            List<UsageQuotaService.Meter> meters) {
    }

    public record InvoiceView(UUID id, String number, String kind, String description,
            String period, String planName, BigDecimal amount, String status,
            OffsetDateTime issuedAt, LocalDate dueDate, OffsetDateTime paidAt,
            String billingType, String invoiceUrl, String bankSlipUrl) {
    }

    public record PixView(String encodedImage, String payload, String expirationDate) {
    }

    public record PackPurchaseView(UUID purchaseId, String status, UUID invoiceId,
            String invoiceUrl, String bankSlipUrl, PixView pix) {
    }

    /** Checkout outcome; {@code userId} is used only to bind the session. */
    public record CheckoutResult(UUID organizationId, UUID userId, String planCode,
            String interval, BigDecimal amount, OffsetDateTime trialEnd, LocalDate nextDueDate,
            String paymentMethod, String cardBrand, String cardLast4) {
    }

    public record InvoicePdf(String filename, byte[] content) {
    }
}
