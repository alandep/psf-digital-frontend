package com.eip.modules.compliance.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.compliance.domain.model.Licenca;

/**
 * Outbound port: persistence for the license aggregate.
 */
public interface LicencaRepositoryPort {

    Licenca salvar(Licenca l);

    Optional<Licenca> porId(UUID id, UUID org);

    List<Licenca> listar(UUID org, String status);
}
