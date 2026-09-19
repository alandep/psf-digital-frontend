package com.eip.modules.bi.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import com.eip.modules.bi.domain.model.Dashboard;
import com.eip.modules.bi.domain.port.out.DashboardRepositoryPort;
import com.eip.platform.error.ConcurrentModificationConflictException;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link DashboardRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class DashboardJpaAdapter implements DashboardRepositoryPort {

    private final DashboardJpaRepository jpa;
    private final DashboardMapper mapper;

    @Override
    public Dashboard salvar(Dashboard d) {
        try {
            DashboardEntity existing = jpa
                    .findByIdAndOrganizationId(d.id().value(), d.organizationId())
                    .orElse(null);
            DashboardEntity entity = mapper.toEntity(d, existing);
            DashboardEntity saved = jpa.saveAndFlush(entity);
            return mapper.toDomain(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrentModificationConflictException(
                    "Dashboard modificado concorrentemente: " + d.id().asString(), ex);
        }
    }

    @Override
    public Optional<Dashboard> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<Dashboard> listar(UUID org) {
        return jpa.findByOrganizationId(org).stream().map(mapper::toDomain).toList();
    }

    @Override
    public void remover(UUID id, UUID org) {
        jpa.findByIdAndOrganizationId(id, org).ifPresent(jpa::delete);
    }
}
