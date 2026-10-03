package com.eip.modules.ai.application.extraction;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

/**
 * Representa um Pedido (ordem de compra) extraído de um documento.
 * Agrega o cabeçalho (número, moeda, Incoterm, valor total) e as linhas de itens.
 */
public record PedidoDto(
        @NotBlank String pedidoNumber,
        @NotBlank String currency,
        @NotBlank String incoterm,
        @NotNull BigDecimal totalAmount,
        @NotEmpty @Valid List<PedidoLineDto> lines) {}
