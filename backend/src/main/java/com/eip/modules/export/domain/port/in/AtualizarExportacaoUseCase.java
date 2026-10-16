package com.eip.modules.export.domain.port.in;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase.CriarExportacaoCommand.ItemCommand;
import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase.ExportacaoView;

/** Inbound port: edit an existing draft export. */
public interface AtualizarExportacaoUseCase {

    ExportacaoView atualizar(UUID id, AtualizarExportacaoCommand cmd);

    /** Command to edit a draft export. */
    record AtualizarExportacaoCommand(
            String destinationCountry,
            String incoterm,
            String currency,
            List<ItemCommand> itens,
            BigDecimal totalCost) {
    }
}
