package com.eip.modules.intelligence.adapter.in.bff;

import com.eip.modules.intelligence.domain.port.in.GerenciarWatchlistUseCase.AdicionarCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for adding a watchlist entry.
 */
public record AdicionarWatchlistRequest(
        @NotBlank String type,
        @NotBlank String label) {

    /** Maps this request to the use-case command. */
    public AdicionarCommand toCommand() {
        return new AdicionarCommand(type, label);
    }
}
