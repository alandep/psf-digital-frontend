package com.eip.modules.intelligence.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.intelligence.domain.model.WatchTargetType;
import com.eip.modules.intelligence.domain.model.WatchlistItem;
import com.eip.modules.intelligence.domain.port.in.GerenciarWatchlistUseCase;
import com.eip.modules.intelligence.domain.port.out.WatchlistRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the tenant watchlist use cases.
 */
@Service
@RequiredArgsConstructor
public class WatchlistService implements GerenciarWatchlistUseCase {

    private final WatchlistRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WatchlistView> listar() {
        return repo.listar(currentOrg()).stream().map(WatchlistView::from).toList();
    }

    @Override
    @Transactional
    public WatchlistView adicionar(AdicionarCommand cmd) {
        UUID org = currentOrg();
        WatchlistItem w = WatchlistItem.novo(
                org,
                null,
                IntelligenceSupport.parse(WatchTargetType.class, cmd.type(), "type"),
                cmd.label());
        WatchlistItem salvo = repo.salvar(w);
        outbox.record("WatchlistItem", salvo.id().toString(), org, "WatchlistAtualizada",
                IntelligenceSupport.payload("watchlistItemId", salvo.id(), org));
        return WatchlistView.from(salvo);
    }

    @Override
    @Transactional
    public void remover(UUID id) {
        UUID org = currentOrg();
        repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Item da watchlist nao encontrado: " + id));
        repo.remover(id, org);
        outbox.record("WatchlistItem", id.toString(), org, "WatchlistAtualizada",
                IntelligenceSupport.payload("watchlistItemId", id, org));
    }

    @Override
    @Transactional
    public WatchlistView alternar(UUID id) {
        UUID org = currentOrg();
        WatchlistItem w = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Item da watchlist nao encontrado: " + id));
        w.toggle();
        WatchlistItem salvo = repo.salvar(w);
        outbox.record("WatchlistItem", salvo.id().toString(), org, "WatchlistAtualizada",
                IntelligenceSupport.payload("watchlistItemId", salvo.id(), org));
        return WatchlistView.from(salvo);
    }
}
