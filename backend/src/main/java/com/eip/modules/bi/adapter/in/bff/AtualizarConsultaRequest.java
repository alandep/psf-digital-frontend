package com.eip.modules.bi.adapter.in.bff;

import com.eip.modules.bi.domain.port.in.GerenciarConsultasUseCase.AtualizarConsultaCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for updating a saved data-explorer query.
 */
public record AtualizarConsultaRequest(
        @NotBlank String name,
        String queryJson) {

    /** Maps this request to the use-case command. */
    public AtualizarConsultaCommand toCommand() {
        return new AtualizarConsultaCommand(name, queryJson);
    }
}
