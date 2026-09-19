package com.eip.modules.finance.adapter.in.bff;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.eip.modules.finance.domain.port.in.GerenciarHedgeUseCase.CriarHedgeCommand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * BFF request payload for creating a hedge contract.
 */
public record CriarHedgeRequest(
        @NotBlank String instrumento,
        @NotBlank String moeda,
        @NotNull @Positive BigDecimal notional,
        BigDecimal strike,
        LocalDate vencimento) {

    /** Maps this request to the use-case command. */
    public CriarHedgeCommand toCommand() {
        return new CriarHedgeCommand(instrumento, moeda, notional, strike, vencimento);
    }
}
