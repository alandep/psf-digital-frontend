package com.eip.modules.finance.adapter.in.bff;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.eip.modules.finance.domain.port.in.GerenciarPagamentosUseCase.CriarPagamentoCommand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * BFF request payload for creating a payment.
 */
public record CriarPagamentoRequest(
        UUID exportId,
        @NotBlank String tipo,
        String descricao,
        @NotNull @Positive BigDecimal amount,
        String currency,
        LocalDate dueDate) {

    /** Maps this request to the use-case command. */
    public CriarPagamentoCommand toCommand() {
        return new CriarPagamentoCommand(exportId, tipo, descricao, amount, currency, dueDate);
    }
}
