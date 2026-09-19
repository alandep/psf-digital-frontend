package com.eip.modules.cms.adapter.in.bff;

import java.util.UUID;

import com.eip.modules.cms.domain.port.in.GerenciarPublicidadeUseCase.CriarCampanhaCommand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * BFF request payload for creating an advertising campaign.
 */
public record CriarCampanhaRequest(
        @NotNull UUID advertiserId,
        @NotBlank String name,
        String placement,
        String startAt,
        String endAt,
        String targetUrl) {

    /** Maps this request to the use-case command. */
    public CriarCampanhaCommand toCommand() {
        return new CriarCampanhaCommand(advertiserId, name, placement, startAt, endAt, targetUrl);
    }
}
