package com.eip.modules.crm.adapter.in.bff;

import com.eip.modules.crm.domain.port.in.GerenciarLeadsUseCase.StatusCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for changing a lead status.
 */
public record AtualizarLeadStatusRequest(@NotBlank String status) {

    /** Maps this request to the use-case command. */
    public StatusCommand toCommand() {
        return new StatusCommand(status);
    }
}
