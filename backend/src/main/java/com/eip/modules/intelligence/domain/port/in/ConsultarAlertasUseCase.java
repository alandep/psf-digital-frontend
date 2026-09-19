package com.eip.modules.intelligence.domain.port.in;

import java.util.List;
import java.util.UUID;

import com.eip.modules.intelligence.domain.model.IntelligenceAlert;

/**
 * Inbound port: consult tenant intelligence alerts.
 */
public interface ConsultarAlertasUseCase {

    List<AlertView> listar();

    AlertView marcarLida(UUID id);

    long naoLidas();

    /** Read view of an alert. */
    record AlertView(
            UUID id,
            String title,
            String impactLevel,
            String relatedTo,
            int affectedOperations,
            String summary,
            boolean read) {

        public static AlertView from(IntelligenceAlert a) {
            return new AlertView(
                    a.id(),
                    a.title(),
                    a.impactLevel() == null ? null : a.impactLevel().name(),
                    a.relatedTo(),
                    a.affectedOperations(),
                    a.summary(),
                    a.read());
        }
    }
}
