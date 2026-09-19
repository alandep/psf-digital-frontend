package com.eip.modules.export.domain.port.in;

import java.util.UUID;

import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase.ExportacaoView;

/**
 * Inbound port: confirm an existing export.
 */
public interface ConfirmarExportacaoUseCase {

    ExportacaoView confirmar(UUID id);
}
