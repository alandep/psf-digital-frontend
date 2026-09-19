package com.eip.modules.bi.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.bi.domain.model.Dashboard;

/**
 * Outbound port: persistence for the dashboard aggregate.
 */
public interface DashboardRepositoryPort {

    Dashboard salvar(Dashboard d);

    Optional<Dashboard> porId(UUID id, UUID org);

    List<Dashboard> listar(UUID org);

    void remover(UUID id, UUID org);
}
