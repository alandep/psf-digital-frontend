package com.eip.modules.logistics.domain.port.in;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.eip.modules.logistics.domain.model.Embarque;

/**
 * Inbound port: manage the shipment (embarque) aggregate lifecycle.
 */
public interface GerenciarEmbarquesUseCase {

    List<EmbarqueResumo> listar(String status);

    EmbarqueView porId(UUID id);

    EmbarqueView criar(CriarEmbarqueCommand cmd);

    EmbarqueView iniciarTransito(UUID id);

    EmbarqueView concluir(UUID id);

    EmbarqueView cancelar(UUID id);

    /** Command to create a shipment. */
    record CriarEmbarqueCommand(
            UUID exportId,
            String reference,
            UUID portoOrigemId,
            UUID portoDestinoId,
            UUID navioId,
            UUID transportadoraId,
            LocalDate etd,
            LocalDate eta,
            String modal) {
    }

    /** Read view of a single shipment. */
    record EmbarqueView(
            UUID id,
            UUID exportId,
            String reference,
            String status,
            UUID portoOrigemId,
            UUID portoDestinoId,
            UUID navioId,
            UUID transportadoraId,
            LocalDate etd,
            LocalDate eta,
            String modal,
            int containerCount) {

        public static EmbarqueView from(Embarque e) {
            return new EmbarqueView(
                    e.id().value(),
                    e.exportId(),
                    e.reference(),
                    e.status().name(),
                    e.portoOrigemId(),
                    e.portoDestinoId(),
                    e.navioId(),
                    e.transportadoraId(),
                    e.etd(),
                    e.eta(),
                    e.modal(),
                    e.containers().size());
        }
    }

    /** Lightweight summary for list views. */
    record EmbarqueResumo(
            UUID id,
            String reference,
            String status,
            LocalDate eta) {
    }
}
