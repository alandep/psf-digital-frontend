package com.eip.modules.finance.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.finance.domain.model.HedgeContrato;

/**
 * Outbound port: persistence for the hedge contract aggregate.
 */
public interface HedgeRepositoryPort {

    HedgeContrato salvar(HedgeContrato h);

    Optional<HedgeContrato> porId(UUID id, UUID org);

    List<HedgeContrato> listar(UUID org, String status);
}
