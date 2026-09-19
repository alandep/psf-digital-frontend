package com.eip.modules.bi.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.bi.domain.model.SavedQuery;
import com.eip.modules.bi.domain.port.out.SavedQueryRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link SavedQueryRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class SavedQueryJpaAdapter implements SavedQueryRepositoryPort {

    private final SavedQueryJpaRepository jpa;
    private final SavedQueryMapper mapper;

    @Override
    public SavedQuery salvar(SavedQuery q) {
        SavedQueryEntity existing = jpa
                .findByIdAndOrganizationId(q.id().value(), q.organizationId())
                .orElse(null);
        SavedQueryEntity entity = mapper.toEntity(q, existing);
        SavedQueryEntity saved = jpa.saveAndFlush(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<SavedQuery> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<SavedQuery> listar(UUID org) {
        return jpa.findByOrganizationId(org).stream().map(mapper::toDomain).toList();
    }

    @Override
    public void remover(UUID id, UUID org) {
        jpa.findByIdAndOrganizationId(id, org).ifPresent(jpa::delete);
    }
}
