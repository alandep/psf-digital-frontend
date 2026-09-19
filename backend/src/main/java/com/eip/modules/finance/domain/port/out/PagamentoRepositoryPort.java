package com.eip.modules.finance.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.finance.domain.model.Pagamento;

/**
 * Outbound port: persistence for the payment aggregate.
 */
public interface PagamentoRepositoryPort {

    Pagamento salvar(Pagamento p);

    Optional<Pagamento> porId(UUID id, UUID org);

    List<Pagamento> listar(UUID org, String status);

    /** Payments filtered by direction and status (used by the summary). */
    List<Pagamento> listarPorTipoEStatus(UUID org, String tipo, String status);
}
