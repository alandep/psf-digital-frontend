package com.eip.modules.cms.adapter.in.bff;

import com.eip.modules.cms.domain.port.in.GerenciarPerfisAcessoUseCase.CriarPerfilCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating an access profile.
 */
public record CriarPerfilRequest(
        @NotBlank String name,
        String description,
        String color,
        String permissions) {

    /** Maps this request to the use-case command. */
    public CriarPerfilCommand toCommand() {
        return new CriarPerfilCommand(name, description, color, permissions);
    }
}
