package com.eip.modules.logistics.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import com.eip.modules.logistics.domain.model.Embarque;
import com.eip.modules.logistics.domain.port.out.EmbarqueRepositoryPort;
import com.eip.platform.error.ConcurrentModificationConflictException;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link EmbarqueRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class EmbarqueJpaAdapter implements EmbarqueRepositoryPort {

    private final EmbarqueJpaRepository jpa;
    private final EmbarqueMapper mapper;

    @Override
    public Embarque salvar(Embarque e) {
        try {
            EmbarqueEntity existing = jpa
                    .findByIdAndOrganizationId(e.id().value(), e.organizationId())
                    .orElse(null);
            EmbarqueEntity entity = mapper.toEntity(e, existing);
            EmbarqueEntity saved = jpa.saveAndFlush(entity);
            return mapper.toDomain(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrentModificationConflictException(
                    "Embarque modificado concorrentemente: " + e.id().asString(), ex);
        }
    }

    @Override
    public Optional<Embarque> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<Embarque> listar(UUID org, String status) {
        List<EmbarqueEntity> result = (status == null || status.isBlank())
                ? jpa.findByOrganizationId(org)
                : jpa.findByOrganizationIdAndStatus(org, status);
        return result.stream().map(mapper::toDomain).toList();
    }
}
