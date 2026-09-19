package com.eip.modules.compliance.adapter.in.bff;

import java.math.BigDecimal;

import com.eip.modules.compliance.domain.port.in.ConsultarEsgUseCase.CriarEsgCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating an ESG assessment.
 */
public record CriarEsgRequest(
        @NotBlank String periodo,
        BigDecimal scoreAmbiental,
        BigDecimal scoreSocial,
        BigDecimal scoreGovernanca,
        BigDecimal scoreTotal,
        String status) {

    /** Maps this request to the use-case command. */
    public CriarEsgCommand toCommand() {
        return new CriarEsgCommand(periodo, scoreAmbiental, scoreSocial, scoreGovernanca, scoreTotal, status);
    }
}
