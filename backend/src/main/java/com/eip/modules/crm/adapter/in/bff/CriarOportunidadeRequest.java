package com.eip.modules.crm.adapter.in.bff;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.eip.modules.crm.domain.port.in.GerenciarOportunidadesUseCase.CriarOportunidadeCommand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * BFF request payload for creating an opportunity.
 */
public record CriarOportunidadeRequest(
        @NotNull UUID clienteId,
        @NotBlank String titulo,
        BigDecimal valorEstimado,
        String moeda,
        Integer probabilidade,
        LocalDate fechamentoPrevisto) {

    /** Maps this request to the use-case command. */
    public CriarOportunidadeCommand toCommand() {
        return new CriarOportunidadeCommand(
                clienteId, titulo, valorEstimado, moeda, probabilidade, fechamentoPrevisto);
    }
}
