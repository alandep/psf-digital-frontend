package com.eip.modules.cms.adapter.in.bff;

import com.eip.modules.cms.domain.port.in.ConsultarConfiguracoesUseCase.SalvarSettingCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating/updating an institutional setting.
 */
public record SalvarSettingRequest(
        @NotBlank String key,
        String value) {

    /** Maps this request to the use-case command. */
    public SalvarSettingCommand toCommand() {
        return new SalvarSettingCommand(key, value);
    }
}
