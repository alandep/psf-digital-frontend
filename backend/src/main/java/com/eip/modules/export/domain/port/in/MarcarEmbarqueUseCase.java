package com.eip.modules.export.domain.port.in;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase.ExportacaoView;

/**
 * Porta de entrada: marcar uma exportação como embarcada. Operação idempotente
 * (marcar embarcado 2x == 1x), suportando o KPI Total Embarcado vs Pendente.
 */
public interface MarcarEmbarqueUseCase {
    ExportacaoView marcarEmbarcado(UUID exportId, OffsetDateTime quando);
}
