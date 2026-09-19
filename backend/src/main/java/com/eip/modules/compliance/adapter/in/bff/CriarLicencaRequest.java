package com.eip.modules.compliance.adapter.in.bff;

import java.time.LocalDate;

import com.eip.modules.compliance.domain.port.in.GerenciarLicencasUseCase.CriarLicencaCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating a license.
 */
public record CriarLicencaRequest(
        @NotBlank String name,
        String tipo,
        String orgao,
        String numero,
        LocalDate emitidaEm,
        LocalDate validaAte) {

    /** Maps this request to the use-case command. */
    public CriarLicencaCommand toCommand() {
        return new CriarLicencaCommand(name, tipo, orgao, numero, emitidaEm, validaAte);
    }
}
