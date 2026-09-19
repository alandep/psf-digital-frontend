package com.eip.modules.compliance.adapter.in.bff;

import com.eip.modules.compliance.domain.port.in.GerenciarScreeningUseCase.CriarScreeningCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating a screening.
 */
public record CriarScreeningRequest(
        @NotBlank String entityName,
        String entityType,
        String document,
        String listsChecked) {

    /** Maps this request to the use-case command. */
    public CriarScreeningCommand toCommand() {
        return new CriarScreeningCommand(entityName, entityType, document, listsChecked);
    }
}
