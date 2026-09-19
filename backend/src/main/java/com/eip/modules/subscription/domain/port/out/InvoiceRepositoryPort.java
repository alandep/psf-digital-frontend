package com.eip.modules.subscription.domain.port.out;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Outbound port for invoices.
 */
public interface InvoiceRepositoryPort {

    List<InvoiceData> forOrg(UUID organizationId);

    record InvoiceData(UUID id, String number, String period, String planName,
            BigDecimal amount, String status, OffsetDateTime issuedAt) {
    }
}
