package com.eip.modules.compliance.adapter.in.bff;

import com.eip.modules.compliance.domain.port.in.GerenciarScreeningUseCase.AprovarCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for approving a screening.
 */
public record AprovarScreeningRequest(
        @NotBlank String riskLevel,
        String summary) {

    /** Maps this request to the use-case command. */
    public AprovarCommand toCommand() {
        return new AprovarCommand(riskLevel, summary);
    }
}
