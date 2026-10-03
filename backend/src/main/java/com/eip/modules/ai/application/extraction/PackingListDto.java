package com.eip.modules.ai.application.extraction;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;

/**
 * Representa um Packing List (romaneio de embarque) extraído de um documento.
 * Agrega a referência, os pesos totais (bruto e líquido em quilos) e as linhas de itens.
 */
public record PackingListDto(
        @NotBlank String reference,
        @NotNull @PositiveOrZero BigDecimal totalGrossWeightKg,
        @NotNull @PositiveOrZero BigDecimal totalNetWeightKg,
        @NotEmpty @Valid List<PackingListLineDto> lines) {}
