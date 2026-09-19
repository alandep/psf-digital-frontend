package com.eip.modules.crm.adapter.in.bff;

import com.eip.modules.crm.domain.port.in.GerenciarClientesUseCase.CriarClienteCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating a CRM customer.
 */
public record CriarClienteRequest(
        @NotBlank String name,
        String cnpj,
        String segmento,
        String pais) {

    /** Maps this request to the use-case command. */
    public CriarClienteCommand toCommand() {
        return new CriarClienteCommand(name, cnpj, segmento, pais);
    }
}
