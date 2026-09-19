package com.eip.modules.cms.adapter.in.bff;

import com.eip.modules.cms.domain.port.in.ConsultarLinksOficiaisUseCase.CriarLinkCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating an official link.
 */
public record CriarLinkRequest(
        String category,
        @NotBlank String name,
        String description,
        @NotBlank String url,
        String country,
        int displayOrder) {

    /** Maps this request to the use-case command. */
    public CriarLinkCommand toCommand() {
        return new CriarLinkCommand(category, name, description, url, country, displayOrder);
    }
}
