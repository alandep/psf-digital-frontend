package com.eip.modules.ai.application.extraction;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * Representa uma linha (item) de um Pedido extraído de um documento.
 * Cada linha identifica o SKU e a quantidade solicitada.
 */
public record PedidoLineDto(
        @NotBlank String sku,
        @NotNull @Positive BigDecimal quantity) {}
