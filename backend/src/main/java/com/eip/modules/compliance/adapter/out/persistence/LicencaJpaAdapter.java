package com.eip.modules.compliance.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import com.eip.modules.compliance.domain.model.Licenca;
import com.eip.modules.compliance.domain.port.out.LicencaRepositoryPort;
import com.eip.platform.error.ConcurrentModificationConflictException;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link LicencaRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class LicencaJpaAdapter implements LicencaRepositoryPort {

    private final LicencaJpaRepository jpa;
    private final LicencaMapper mapper;

    @Override
    public Licenca salvar(Licenca l) {
        try {
            LicencaEntity existing = jpa
                    .findByIdAndOrganizationId(l.id().value(), l.organizationId())
                    .orElse(null);
            LicencaEntity entity = mapper.toEntity(l, existing);
            LicencaEntity saved = jpa.saveAndFlush(entity);
            return mapper.toDomain(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrentModificationConflictException(
                    "Licenca modificada concorrentemente: " + l.id().asString(), ex);
        }
    }

    @Override
    public Optional<Licenca> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<Licenca> listar(UUID org, String status) {
        List<LicencaEntity> rows = (status == null || status.isBlank())
                ? jpa.findByOrganizationId(org)
                : jpa.findByOrganizationIdAndStatus(org, status);
        return rows.stream().map(mapper::toDomain).toList();
    }
}
