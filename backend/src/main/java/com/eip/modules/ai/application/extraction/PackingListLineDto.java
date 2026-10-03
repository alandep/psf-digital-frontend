package com.eip.modules.ai.application.extraction;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * Representa uma linha (item) de um Packing List extraído de um documento.
 * Cada linha identifica o SKU, a quantidade e os pesos bruto e líquido em quilos.
 */
public record PackingListLineDto(
        @NotBlank String sku,
        @NotNull @Positive BigDecimal quantity,
        @NotNull @PositiveOrZero BigDecimal grossWeightKg,
        @NotNull @PositiveOrZero BigDecimal netWeightKg) {}
