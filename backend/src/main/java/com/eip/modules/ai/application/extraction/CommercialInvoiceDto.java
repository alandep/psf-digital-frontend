package com.eip.modules.ai.application.extraction;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

/**
 * Representa uma Commercial Invoice (fatura comercial) extraída de um documento.
 * Agrega o cabeçalho (número, valor total, moeda, Incoterm) e as linhas de itens.
 */
public record CommercialInvoiceDto(
        @NotBlank String invoiceNumber,
        @NotNull BigDecimal totalAmount,
        @NotBlank String currency,
        @NotBlank String incoterm,
        @NotEmpty @Valid List<InvoiceLineDto> lines) {}
