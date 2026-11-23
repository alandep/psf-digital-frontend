package com.eip.modules.subscription.domain.port.out;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Outbound port for add-on (pack) purchases (tenant-scoped, RLS).
 */
public interface AddonPurchaseRepositoryPort {

    Optional<AddonPurchaseData> byId(UUID id);

    /** Inserts or updates (by id). */
    AddonPurchaseData save(AddonPurchaseData purchase);

    /** Add-on purchase row. {@code status} is PENDING, PAID or CANCELED. */
    record AddonPurchaseData(UUID id, UUID organizationId, String addonCode, int aiCredits,
            int ocrPages, BigDecimal amount, String status, String billingType, UUID invoiceId,
            String asaasPaymentId, OffsetDateTime periodStart, OffsetDateTime periodEnd,
            OffsetDateTime createdAt, OffsetDateTime paidAt) {

        public AddonPurchaseData paid(OffsetDateTime now, OffsetDateTime end) {
            return new AddonPurchaseData(id, organizationId, addonCode, aiCredits, ocrPages,
                    amount, "PAID", billingType, invoiceId, asaasPaymentId, now, end, createdAt,
                    now);
        }

        public AddonPurchaseData canceled() {
            return new AddonPurchaseData(id, organizationId, addonCode, aiCredits, ocrPages,
                    amount, "CANCELED", billingType, invoiceId, asaasPaymentId, periodStart,
                    periodEnd, createdAt, paidAt);
        }

        public AddonPurchaseData withPayment(UUID newInvoiceId, String paymentId) {
            return new AddonPurchaseData(id, organizationId, addonCode, aiCredits, ocrPages,
                    amount, status, billingType, newInvoiceId, paymentId, periodStart, periodEnd,
                    createdAt, paidAt);
        }
    }
}
