package com.eip.modules.cms.adapter.in.bff;

import com.eip.modules.cms.domain.port.in.GerenciarPublicidadeUseCase.CriarAnuncianteCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating an advertiser.
 */
public record CriarAnuncianteRequest(
        String legalName,
        @NotBlank String tradeName,
        String cnpj,
        String website) {

    /** Maps this request to the use-case command. */
    public CriarAnuncianteCommand toCommand() {
        return new CriarAnuncianteCommand(legalName, tradeName, cnpj, website);
    }
}
