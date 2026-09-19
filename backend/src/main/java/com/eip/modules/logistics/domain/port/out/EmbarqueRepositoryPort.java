package com.eip.modules.logistics.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.logistics.domain.model.Embarque;

/**
 * Outbound port: persistence for the shipment (embarque) aggregate.
 */
public interface EmbarqueRepositoryPort {

    Embarque salvar(Embarque e);

    Optional<Embarque> porId(UUID id, UUID org);

    List<Embarque> listar(UUID org, String status);
}
