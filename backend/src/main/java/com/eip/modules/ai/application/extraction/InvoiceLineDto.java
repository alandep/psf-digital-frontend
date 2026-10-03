package com.eip.modules.ai.application.extraction;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * Representa uma linha (item) de uma Commercial Invoice extraída de um documento.
 * Cada linha identifica o SKU, a quantidade e o preço unitário.
 */
public record InvoiceLineDto(
        @NotBlank String sku,
        @NotNull @Positive BigDecimal quantity,
        @NotNull BigDecimal unitPrice) {}
