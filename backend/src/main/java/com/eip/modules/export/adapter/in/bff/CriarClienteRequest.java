package com.eip.modules.export.adapter.in.bff;

import com.eip.modules.export.domain.port.in.ClienteUseCase.CriarClienteCommand;

import jakarta.validation.constraints.NotBlank;

/** BFF payload to register an importer. */
public record CriarClienteRequest(
        @NotBlank String name,
        String country,
        String document,
        String address,
        String contact) {

    public CriarClienteCommand toCommand() {
        return new CriarClienteCommand(name, country, document, address, contact);
    }
}
