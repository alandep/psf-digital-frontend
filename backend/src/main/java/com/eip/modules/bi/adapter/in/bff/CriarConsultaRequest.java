package com.eip.modules.bi.adapter.in.bff;

import com.eip.modules.bi.domain.port.in.GerenciarConsultasUseCase.CriarConsultaCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating a saved data-explorer query.
 */
public record CriarConsultaRequest(
        @NotBlank String name,
        String dataset,
        String queryJson) {

    /** Maps this request to the use-case command. */
    public CriarConsultaCommand toCommand() {
        return new CriarConsultaCommand(name, dataset, queryJson);
    }
}
