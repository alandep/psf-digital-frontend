package com.eip.modules.finance.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.finance.domain.model.CambioContrato;

/**
 * Outbound port: persistence for the FX contract aggregate.
 */
public interface CambioRepositoryPort {

    CambioContrato salvar(CambioContrato c);

    Optional<CambioContrato> porId(UUID id, UUID org);

    List<CambioContrato> listar(UUID org, String status);
}
