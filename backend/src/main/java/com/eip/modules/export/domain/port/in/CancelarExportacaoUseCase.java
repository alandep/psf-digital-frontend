package com.eip.modules.export.domain.port.in;

import java.util.UUID;

/** Inbound port: cancel (soft-delete) an export. */
public interface CancelarExportacaoUseCase {

    void cancelar(UUID id);
}
