package com.eip.modules.finance.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import com.eip.modules.finance.domain.model.HedgeContrato;
import com.eip.modules.finance.domain.port.out.HedgeRepositoryPort;
import com.eip.platform.error.ConcurrentModificationConflictException;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link HedgeRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class HedgeContratoJpaAdapter implements HedgeRepositoryPort {

    private final HedgeContratoJpaRepository jpa;
    private final HedgeContratoMapper mapper;

    @Override
    public HedgeContrato salvar(HedgeContrato h) {
        try {
            HedgeContratoEntity existing = jpa
                    .findByIdAndOrganizationId(h.id().value(), h.organizationId())
                    .orElse(null);
            HedgeContratoEntity entity = mapper.toEntity(h, existing);
            HedgeContratoEntity saved = jpa.saveAndFlush(entity);
            return mapper.toDomain(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrentModificationConflictException(
                    "Hedge modificado concorrentemente: " + h.id().asString(), ex);
        }
    }

    @Override
    public Optional<HedgeContrato> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<HedgeContrato> listar(UUID org, String status) {
        List<HedgeContratoEntity> rows = (status == null || status.isBlank())
                ? jpa.findByOrganizationId(org)
                : jpa.findByOrganizationIdAndStatus(org, status);
        return rows.stream().map(mapper::toDomain).toList();
    }
}
