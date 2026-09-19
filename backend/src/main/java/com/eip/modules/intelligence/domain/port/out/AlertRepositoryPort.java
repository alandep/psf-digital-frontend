package com.eip.modules.intelligence.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.intelligence.domain.model.IntelligenceAlert;

/**
 * Outbound port: persistence for the tenant intelligence alert aggregate.
 */
public interface AlertRepositoryPort {

    List<IntelligenceAlert> listar(UUID org);

    Optional<IntelligenceAlert> porId(UUID id, UUID org);

    IntelligenceAlert salvar(IntelligenceAlert a);

    long countUnread(UUID org);
}
