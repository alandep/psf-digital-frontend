package com.eip.modules.compliance.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.compliance.domain.model.Screening;

/**
 * Outbound port: persistence for the screening aggregate.
 */
public interface ScreeningRepositoryPort {

    Screening salvar(Screening s);

    Optional<Screening> porId(UUID id, UUID org);

    List<Screening> listar(UUID org, String status);
}
