package com.eip.modules.intelligence.domain.port.in;

import java.util.List;
import java.util.UUID;

import com.eip.modules.intelligence.domain.model.WatchlistItem;

/**
 * Inbound port: manage the tenant watchlist.
 */
public interface GerenciarWatchlistUseCase {

    List<WatchlistView> listar();

    WatchlistView adicionar(AdicionarCommand cmd);

    void remover(UUID id);

    WatchlistView alternar(UUID id);

    /** Command to add a watchlist entry. */
    record AdicionarCommand(String type, String label) {
    }

    /** Read view of a watchlist entry. */
    record WatchlistView(
            UUID id,
            String type,
            String label,
            boolean active) {

        public static WatchlistView from(WatchlistItem w) {
            return new WatchlistView(
                    w.id(),
                    w.type() == null ? null : w.type().name(),
                    w.label(),
                    w.active());
        }
    }
}
