package com.eip.modules.cms.adapter.in.bff;

import com.eip.modules.cms.domain.port.in.GerenciarPerfisAcessoUseCase.AtualizarPerfilCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for updating an access profile.
 */
public record AtualizarPerfilRequest(
        @NotBlank String name,
        String description,
        String permissions) {

    /** Maps this request to the use-case command. */
    public AtualizarPerfilCommand toCommand() {
        return new AtualizarPerfilCommand(name, description, permissions);
    }
}
