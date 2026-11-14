package com.eip.modules.finance.adapter.in.bff;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.eip.modules.finance.domain.port.in.GerenciarPagamentosUseCase.PagamentoCommand;

/**
 * BFF request payload for creating or updating a payment. Validation is done
 * in the domain so errors come back as 422 with pt-BR messages.
 */
public record CriarPagamentoRequest(
        UUID exportId,
        String tipo,
        String descricao,
        String contraparte,
        String referencia,
        String contaBancaria,
        UUID contratoCambioId,
        String observacoes,
        BigDecimal amount,
        String currency,
        LocalDate dueDate) {

    /** Maps this request to the use-case command. */
    public PagamentoCommand toCommand() {
        return new PagamentoCommand(exportId, tipo, descricao, contraparte, referencia,
                contaBancaria, contratoCambioId, observacoes, amount, currency, dueDate);
    }
}
