package com.eip.modules.finance.domain.port.out;

import java.util.List;
import java.util.UUID;

import com.eip.modules.finance.domain.model.RentabilidadeAnalise;

/**
 * Outbound port: persistence for saved profitability analyses.
 */
public interface RentabilidadeAnaliseRepositoryPort {

    /** Persists a new analysis and returns it with its creation timestamp. */
    RentabilidadeAnalise salvar(RentabilidadeAnalise analise);

    /** Latest analyses of the organization, newest first. */
    List<RentabilidadeAnalise> listarRecentes(UUID org, int limite);

    /** @return {@code true} if a row was removed */
    boolean excluir(UUID id, UUID org);
}
