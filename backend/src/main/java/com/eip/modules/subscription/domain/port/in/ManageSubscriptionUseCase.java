package com.eip.modules.subscription.domain.port.in;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Inbound port for the organization-facing billing screens. Backs the front
 * {@code saasBillingMockService}: current subscription, plans, usage meters,
 * invoices and the change/cancel/reactivate flows.
 */
public interface ManageSubscriptionUseCase {

    SubscriptionView current();

    List<PlanView> plans();

    List<UsageView> usage();

    List<InvoiceView> invoices();

    SubscriptionView changePlan(String planCode);

    SubscriptionView cancel(String reason);

    SubscriptionView reactivate();

    record PlanView(String code, String name, String description,
            BigDecimal monthlyPrice, BigDecimal annualPrice, boolean highlighted) {
    }

    record SubscriptionView(UUID id, String planCode, String planName,
            String billingInterval, BigDecimal amount, String status,
            OffsetDateTime currentPeriodEnd, String paymentBrand, String paymentLast4,
            String licenseMode) {
    }

    record UsageView(String feature, String label, BigDecimal used,
            BigDecimal included, String unit, int percent) {
    }

    record InvoiceView(UUID id, String number, String period, String planName,
            BigDecimal amount, String status, OffsetDateTime issuedAt) {
    }
}
