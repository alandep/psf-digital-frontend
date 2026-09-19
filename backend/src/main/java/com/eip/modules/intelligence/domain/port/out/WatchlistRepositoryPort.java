package com.eip.modules.intelligence.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.intelligence.domain.model.WatchlistItem;

/**
 * Outbound port: persistence for the tenant watchlist aggregate.
 */
public interface WatchlistRepositoryPort {

    WatchlistItem salvar(WatchlistItem w);

    Optional<WatchlistItem> porId(UUID id, UUID org);

    List<WatchlistItem> listar(UUID org);

    void remover(UUID id, UUID org);
}
