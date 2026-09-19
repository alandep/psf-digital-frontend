package com.eip.modules.compliance.domain.port.in;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.eip.modules.compliance.domain.model.EsgAvaliacao;

/**
 * Inbound port: consult and register ESG assessments.
 */
public interface ConsultarEsgUseCase {

    List<EsgView> listar();

    EsgView criar(CriarEsgCommand cmd);

    /** Command to create an ESG assessment. */
    record CriarEsgCommand(
            String periodo,
            BigDecimal scoreAmbiental,
            BigDecimal scoreSocial,
            BigDecimal scoreGovernanca,
            BigDecimal scoreTotal,
            String status) {
    }

    /** Read view of a single ESG assessment. */
    record EsgView(
            UUID id,
            String periodo,
            BigDecimal scoreAmbiental,
            BigDecimal scoreSocial,
            BigDecimal scoreGovernanca,
            BigDecimal scoreTotal,
            String status) {

        public static EsgView from(EsgAvaliacao e) {
            return new EsgView(
                    e.id(),
                    e.periodo(),
                    e.scoreAmbiental(),
                    e.scoreSocial(),
                    e.scoreGovernanca(),
                    e.scoreTotal(),
                    e.status().name());
        }
    }
}
