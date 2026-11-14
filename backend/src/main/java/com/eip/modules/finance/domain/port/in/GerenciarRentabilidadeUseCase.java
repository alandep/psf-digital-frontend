package com.eip.modules.finance.domain.port.in;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.eip.modules.finance.domain.model.RentabilidadeAnalise;

/**
 * Inbound port: save, list and delete profitability analyses.
 */
public interface GerenciarRentabilidadeUseCase {

    /** Latest 100 analyses of the current organization. */
    List<RentabilidadeAnalise> listar();

    RentabilidadeAnalise criar(CriarAnaliseCommand cmd);

    void excluir(UUID id);

    /**
     * Command to save an analysis.
     *
     * @param payloadJson serialized JSON object with the full analysis
     */
    record CriarAnaliseCommand(
            String exportacaoRef,
            String produto,
            Integer score,
            BigDecimal margem,
            BigDecimal lucroBrl,
            String payloadJson) {
    }
}
