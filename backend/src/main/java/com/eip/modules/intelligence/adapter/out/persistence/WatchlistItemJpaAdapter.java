package com.eip.modules.intelligence.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.intelligence.domain.model.WatchlistItem;
import com.eip.modules.intelligence.domain.port.out.WatchlistRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link WatchlistRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class WatchlistItemJpaAdapter implements WatchlistRepositoryPort {

    private final WatchlistItemJpaRepository jpa;
    private final WatchlistItemMapper mapper;

    @Override
    public WatchlistItem salvar(WatchlistItem w) {
        WatchlistItemEntity existing = jpa
                .findByIdAndOrganizationId(w.id(), w.organizationId())
                .orElse(null);
        WatchlistItemEntity entity = mapper.toEntity(w, existing);
        return mapper.toDomain(jpa.saveAndFlush(entity));
    }

    @Override
    public Optional<WatchlistItem> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<WatchlistItem> listar(UUID org) {
        return jpa.findByOrganizationId(org).stream().map(mapper::toDomain).toList();
    }

    @Override
    public void remover(UUID id, UUID org) {
        jpa.deleteByIdAndOrganizationId(id, org);
    }
}
