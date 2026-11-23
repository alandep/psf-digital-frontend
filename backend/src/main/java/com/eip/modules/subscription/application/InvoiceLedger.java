package com.eip.modules.subscription.application;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.model.BillingRules;
import com.eip.modules.subscription.domain.model.Subscription;
import com.eip.modules.subscription.domain.port.out.AddonPurchaseRepositoryPort;
import com.eip.modules.subscription.domain.port.out.AddonPurchaseRepositoryPort.AddonPurchaseData;
import com.eip.modules.subscription.domain.port.out.InvoiceRepositoryPort;
import com.eip.modules.subscription.domain.port.out.InvoiceRepositoryPort.InvoiceData;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.GatewayPayment;

import lombok.RequiredArgsConstructor;

/**
 * Mirrors gateway payments into local invoices (upsert by
 * {@code asaas_payment_id}). Shared by the invoice sync and the webhook. Must run
 * inside a transaction bound to the owning organization (RLS).
 */
@Component
@RequiredArgsConstructor
public class InvoiceLedger {

    private final InvoiceRepositoryPort invoices;
    private final AddonPurchaseRepositoryPort addons;

    /** Whether the payment belongs to an add-on (pack) purchase. */
    public static boolean isAddon(GatewayPayment p) {
        return p.externalReference() != null
                && p.externalReference().startsWith(BillingRules.ADDON_REF_PREFIX);
    }

    /** Add-on purchase id carried by the external reference, if any. */
    public static Optional<UUID> addonPurchaseId(GatewayPayment p) {
        if (!isAddon(p)) {
            return Optional.empty();
        }
        try {
            return Optional.of(UUID.fromString(
                    p.externalReference().substring(BillingRules.ADDON_REF_PREFIX.length())));
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public Optional<AddonPurchaseData> addonOf(GatewayPayment p) {
        return addonPurchaseId(p).flatMap(addons::byId);
    }

    /** Existing local invoice of the payment (by gateway id, else via the add-on purchase). */
    public Optional<InvoiceData> find(GatewayPayment p) {
        Optional<InvoiceData> byPayment = invoices.byAsaasPaymentId(p.id());
        if (byPayment.isPresent()) {
            return byPayment;
        }
        return addonOf(p).map(AddonPurchaseData::invoiceId).flatMap(invoices::byId);
    }

    /**
     * Inserts or updates the invoice of a gateway payment.
     *
     * @param statusOverride local status to set, or {@code null} to map the gateway status
     */
    public InvoiceData upsert(UUID organizationId, Subscription sub, GatewayPayment p,
            String statusOverride) {
        OffsetDateTime now = OffsetDateTime.now();
        InvoiceData existing = find(p).orElse(null);
        boolean addon = isAddon(p);
        String status = statusOverride != null ? statusOverride
                : BillingRules.invoiceStatusFromGateway(p.status());
        OffsetDateTime paidAt = null;
        if (BillingRules.INVOICE_PAID.equals(status)) {
            paidAt = existing != null && existing.paidAt() != null ? existing.paidAt()
                    : p.paymentDate() != null ? BillingRules.startOfDay(p.paymentDate()) : now;
        } else if (existing != null) {
            paidAt = existing.paidAt();
        }
        String planName = existing != null && existing.planName() != null ? existing.planName()
                : addon ? p.description() : sub != null ? sub.planName() : null;
        String description = p.description() != null ? p.description()
                : existing != null && existing.description() != null ? existing.description()
                : planName;
        BigDecimal amount = p.value() != null ? p.value()
                : existing != null ? existing.amount() : BigDecimal.ZERO;
        InvoiceData data = new InvoiceData(
                existing != null ? existing.id() : UUID.randomUUID(),
                organizationId,
                existing != null && existing.subscriptionId() != null ? existing.subscriptionId()
                        : sub != null ? sub.id().value() : null,
                BillingRules.invoiceNumber(p.invoiceNumber(), p.id(), p.dueDate()),
                p.dueDate() != null ? BillingRules.period(p.dueDate())
                        : existing != null ? existing.period() : null,
                planName,
                amount,
                status,
                existing != null ? existing.issuedAt() : now,
                p.id(),
                addon ? BillingRules.KIND_ADDON : BillingRules.KIND_SUBSCRIPTION,
                description,
                p.dueDate() != null ? p.dueDate() : existing != null ? existing.dueDate() : null,
                paidAt,
                p.billingType() != null ? p.billingType()
                        : existing != null ? existing.billingType() : null,
                p.invoiceUrl() != null ? p.invoiceUrl()
                        : existing != null ? existing.invoiceUrl() : null,
                p.bankSlipUrl() != null ? p.bankSlipUrl()
                        : existing != null ? existing.bankSlipUrl() : null,
                p.netValue() != null ? p.netValue() : existing != null ? existing.netValue() : null);
        return invoices.save(data);
    }
}
