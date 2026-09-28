package com.eip.modules.export.domain.port.in;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase.ExportacaoView;

/**
 * Inbound port: query exports.
 */
public interface ListarExportacoesUseCase {

    ExportacoesPage paraLista(int page, int size, String status);

    ExportacaoView porId(UUID id);

    ExportacoesDashboard dashboard();

    /** Page of export summaries. */
    record ExportacoesPage(
            List<ExportacaoResumo> content,
            int page,
            int size,
            long total) {
    }

    /** Lightweight summary for list views. */
    record ExportacaoResumo(
            UUID id,
            String reference,
            String status,
            String destinationCountry,
            BigDecimal totalAmount,
            String currency) {
    }

    /** Aggregate counters for the export dashboard. */
    record ExportacoesDashboard(
            long total,
            long rascunho,
            long confirmadas,
            long canceladas,
            BigDecimal valorTotal,
            List<ContagemPorStatus> porStatus) {
    }

    /** One status bucket. */
    record ContagemPorStatus(String status, long quantidade) {
    }
}
