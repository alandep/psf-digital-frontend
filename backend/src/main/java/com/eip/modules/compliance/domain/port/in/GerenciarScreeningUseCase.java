package com.eip.modules.compliance.domain.port.in;

import java.util.List;
import java.util.UUID;

import com.eip.modules.compliance.domain.model.Screening;

/**
 * Inbound port: manage sanctions / PEP screenings.
 */
public interface GerenciarScreeningUseCase {

    List<ScreeningView> listar(String status);

    ScreeningView porId(UUID id);

    ScreeningView criar(CriarScreeningCommand cmd);

    ScreeningView iniciarAnalise(UUID id);

    ScreeningView aprovar(UUID id, AprovarCommand cmd);

    ScreeningView reprovar(UUID id, ReprovarCommand cmd);

    /** Command to create a screening. */
    record CriarScreeningCommand(
            String entityName,
            String entityType,
            String document,
            String listsChecked) {
    }

    /** Command to approve a screening. */
    record AprovarCommand(String riskLevel, String summary) {
    }

    /** Command to reject a screening. */
    record ReprovarCommand(String summary) {
    }

    /** Read view of a single screening. */
    record ScreeningView(
            UUID id,
            String entityName,
            String entityType,
            String document,
            String status,
            String riskLevel,
            String listsChecked,
            String resultSummary) {

        public static ScreeningView from(Screening s) {
            return new ScreeningView(
                    s.id().value(),
                    s.entityName(),
                    s.entityType(),
                    s.document(),
                    s.status().name(),
                    s.riskLevel() == null ? null : s.riskLevel().name(),
                    s.listsChecked(),
                    s.resultSummary());
        }
    }
}
