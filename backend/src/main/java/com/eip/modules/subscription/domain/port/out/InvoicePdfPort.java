package com.eip.modules.subscription.domain.port.out;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Renders the "segunda via" PDF of an invoice.
 */
public interface InvoicePdfPort {

    byte[] render(InvoiceDocument document);

    /**
     * Data printed on the invoice. Pix fields are filled only for open Pix
     * invoices; {@code bankSlipUrl} only matters for open boletos.
     */
    record InvoiceDocument(String issuerName, String issuerCnpj, String issuerAddress,
            String issuerEmail, String customerName, String customerCnpj, String customerEmail,
            String number, OffsetDateTime issuedAt, LocalDate dueDate, OffsetDateTime paidAt,
            String status, String billingType, String description, String period,
            BigDecimal amount, String invoiceUrl, String bankSlipUrl, String pixEncodedImage,
            String pixPayload, OffsetDateTime generatedAt) {
    }
}
