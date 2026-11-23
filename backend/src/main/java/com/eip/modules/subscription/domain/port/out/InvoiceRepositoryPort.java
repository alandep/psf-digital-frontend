package com.eip.modules.subscription.domain.port.out;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Outbound port for invoices (tenant-scoped, RLS).
 */
public interface InvoiceRepositoryPort {

    List<InvoiceData> forOrg(UUID organizationId);

    Optional<InvoiceData> byId(UUID id);

    Optional<InvoiceData> byAsaasPaymentId(String asaasPaymentId);

    /** Inserts or updates (by id). */
    InvoiceData save(InvoiceData invoice);

    /** Invoice row. {@code kind} is SUBSCRIPTION or ADDON. */
    record InvoiceData(UUID id, UUID organizationId, UUID subscriptionId, String number,
            String period, String planName, BigDecimal amount, String status,
            OffsetDateTime issuedAt, String asaasPaymentId, String kind, String description,
            LocalDate dueDate, OffsetDateTime paidAt, String billingType, String invoiceUrl,
            String bankSlipUrl, BigDecimal netValue) {

        public InvoiceData withStatus(String newStatus, OffsetDateTime newPaidAt) {
            return new InvoiceData(id, organizationId, subscriptionId, number, period, planName,
                    amount, newStatus, issuedAt, asaasPaymentId, kind, description, dueDate,
                    newPaidAt, billingType, invoiceUrl, bankSlipUrl, netValue);
        }

        public InvoiceData withGateway(String paymentId, String newNumber, String newInvoiceUrl,
                String newBankSlipUrl) {
            return new InvoiceData(id, organizationId, subscriptionId, newNumber, period,
                    planName, amount, status, issuedAt, paymentId, kind, description, dueDate,
                    paidAt, billingType, newInvoiceUrl, newBankSlipUrl, netValue);
        }
    }
}
