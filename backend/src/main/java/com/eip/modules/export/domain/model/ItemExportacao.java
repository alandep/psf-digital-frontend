package com.eip.modules.export.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Immutable line item of an export.
 */
public record ItemExportacao(
        UUID id,
        UUID productId,
        String description,
        BigDecimal quantity,
        BigDecimal unitPrice) {

    public ItemExportacao {
        if (quantity == null) {
            quantity = BigDecimal.ZERO;
        }
        if (unitPrice == null) {
            unitPrice = BigDecimal.ZERO;
        }
        if (id == null) {
            id = UUID.randomUUID();
        }
    }

    /** @return quantity * unitPrice */
    public BigDecimal subtotal() {
        return quantity.multiply(unitPrice);
    }
}
