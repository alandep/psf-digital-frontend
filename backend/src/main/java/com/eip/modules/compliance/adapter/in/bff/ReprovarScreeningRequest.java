package com.eip.modules.compliance.adapter.in.bff;

import com.eip.modules.compliance.domain.port.in.GerenciarScreeningUseCase.ReprovarCommand;

/**
 * BFF request payload for rejecting a screening.
 */
public record ReprovarScreeningRequest(String summary) {

    /** Maps this request to the use-case command. */
    public ReprovarCommand toCommand() {
        return new ReprovarCommand(summary);
    }
}
