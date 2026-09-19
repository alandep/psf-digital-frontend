package com.eip.modules.compliance.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import com.eip.modules.compliance.domain.model.Screening;
import com.eip.modules.compliance.domain.port.out.ScreeningRepositoryPort;
import com.eip.platform.error.ConcurrentModificationConflictException;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link ScreeningRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class ScreeningJpaAdapter implements ScreeningRepositoryPort {

    private final ScreeningJpaRepository jpa;
    private final ScreeningMapper mapper;

    @Override
    public Screening salvar(Screening s) {
        try {
            ScreeningEntity existing = jpa
                    .findByIdAndOrganizationId(s.id().value(), s.organizationId())
                    .orElse(null);
            ScreeningEntity entity = mapper.toEntity(s, existing);
            ScreeningEntity saved = jpa.saveAndFlush(entity);
            return mapper.toDomain(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrentModificationConflictException(
                    "Screening modificado concorrentemente: " + s.id().asString(), ex);
        }
    }

    @Override
    public Optional<Screening> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<Screening> listar(UUID org, String status) {
        List<ScreeningEntity> rows = (status == null || status.isBlank())
                ? jpa.findByOrganizationId(org)
                : jpa.findByOrganizationIdAndStatus(org, status);
        return rows.stream().map(mapper::toDomain).toList();
    }
}
