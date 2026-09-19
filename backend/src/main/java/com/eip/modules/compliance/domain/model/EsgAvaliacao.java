package com.eip.modules.compliance.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * ESG (environmental, social, governance) assessment domain type. Mostly
 * CRUD/read; modelled as an immutable record.
 */
public record EsgAvaliacao(
        UUID id,
        UUID organizationId,
        String periodo,
        BigDecimal scoreAmbiental,
        BigDecimal scoreSocial,
        BigDecimal scoreGovernanca,
        BigDecimal scoreTotal,
        EsgStatus status) {

    /** Creates a new ESG assessment with a default RASCUNHO status. */
    public static EsgAvaliacao nova(UUID org, String periodo, BigDecimal scoreAmbiental,
                                    BigDecimal scoreSocial, BigDecimal scoreGovernanca,
                                    BigDecimal scoreTotal, EsgStatus status) {
        if (periodo == null || periodo.isBlank()) {
            throw new BusinessRuleException("Periodo da avaliacao ESG e obrigatorio");
        }
        return new EsgAvaliacao(
                UUID.randomUUID(),
                org,
                periodo,
                scoreAmbiental,
                scoreSocial,
                scoreGovernanca,
                scoreTotal,
                status == null ? EsgStatus.RASCUNHO : status);
    }
}
