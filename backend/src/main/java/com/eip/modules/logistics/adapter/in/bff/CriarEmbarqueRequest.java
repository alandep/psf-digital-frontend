package com.eip.modules.logistics.adapter.in.bff;

import java.time.LocalDate;
import java.util.UUID;

import com.eip.modules.logistics.domain.port.in.GerenciarEmbarquesUseCase.CriarEmbarqueCommand;

/**
 * BFF request payload for creating a shipment.
 */
public record CriarEmbarqueRequest(
        UUID exportId,
        String reference,
        UUID portoOrigemId,
        UUID portoDestinoId,
        UUID navioId,
        UUID transportadoraId,
        LocalDate etd,
        LocalDate eta,
        String modal) {

    /** Maps this request to the use-case command. */
    public CriarEmbarqueCommand toCommand() {
        return new CriarEmbarqueCommand(
                exportId, reference, portoOrigemId, portoDestinoId,
                navioId, transportadoraId, etd, eta, modal);
    }
}
