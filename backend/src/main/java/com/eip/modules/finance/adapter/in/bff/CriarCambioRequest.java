package com.eip.modules.finance.adapter.in.bff;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.eip.modules.finance.domain.port.in.GerenciarCambioUseCase.CriarCambioCommand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * BFF request payload for creating an FX contract.
 */
public record CriarCambioRequest(
        String banco,
        @NotBlank String moeda,
        @NotNull @Positive BigDecimal valor,
        @NotNull @Positive BigDecimal taxa,
        @NotBlank String tipo,
        LocalDate dataContratacao,
        LocalDate dataLiquidacao) {

    /** Maps this request to the use-case command. */
    public CriarCambioCommand toCommand() {
        return new CriarCambioCommand(
                banco, moeda, valor, taxa, tipo, dataContratacao, dataLiquidacao);
    }
}
