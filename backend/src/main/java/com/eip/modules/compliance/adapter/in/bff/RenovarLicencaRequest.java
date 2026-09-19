package com.eip.modules.compliance.adapter.in.bff;

import java.time.LocalDate;

import com.eip.modules.compliance.domain.port.in.GerenciarLicencasUseCase.RenovarCommand;

import jakarta.validation.constraints.NotNull;

/**
 * BFF request payload for renewing a license.
 */
public record RenovarLicencaRequest(
        @NotNull LocalDate validaAte) {

    /** Maps this request to the use-case command. */
    public RenovarCommand toCommand() {
        return new RenovarCommand(validaAte);
    }
}
