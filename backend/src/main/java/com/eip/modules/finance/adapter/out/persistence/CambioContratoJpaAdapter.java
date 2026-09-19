package com.eip.modules.finance.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import com.eip.modules.finance.domain.model.CambioContrato;
import com.eip.modules.finance.domain.port.out.CambioRepositoryPort;
import com.eip.platform.error.ConcurrentModificationConflictException;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link CambioRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class CambioContratoJpaAdapter implements CambioRepositoryPort {

    private final CambioContratoJpaRepository jpa;
    private final CambioContratoMapper mapper;

    @Override
    public CambioContrato salvar(CambioContrato c) {
        try {
            CambioContratoEntity existing = jpa
                    .findByIdAndOrganizationId(c.id().value(), c.organizationId())
                    .orElse(null);
            CambioContratoEntity entity = mapper.toEntity(c, existing);
            CambioContratoEntity saved = jpa.saveAndFlush(entity);
            return mapper.toDomain(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrentModificationConflictException(
                    "Cambio modificado concorrentemente: " + c.id().asString(), ex);
        }
    }

    @Override
    public Optional<CambioContrato> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<CambioContrato> listar(UUID org, String status) {
        List<CambioContratoEntity> rows = (status == null || status.isBlank())
                ? jpa.findByOrganizationId(org)
                : jpa.findByOrganizationIdAndStatus(org, status);
        return rows.stream().map(mapper::toDomain).toList();
    }
}
