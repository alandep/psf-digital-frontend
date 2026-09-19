package com.eip.modules.crm.adapter.in.bff;

import com.eip.modules.crm.domain.port.in.GerenciarOportunidadesUseCase.EstagioCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for advancing an opportunity to a new stage.
 */
public record AvancarOportunidadeRequest(@NotBlank String estagio) {

    /** Maps this request to the use-case command. */
    public EstagioCommand toCommand() {
        return new EstagioCommand(estagio);
    }
}
