package com.eip.modules.crm.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import com.eip.modules.crm.domain.model.Oportunidade;
import com.eip.modules.crm.domain.port.out.OportunidadeRepositoryPort;
import com.eip.platform.error.ConcurrentModificationConflictException;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link OportunidadeRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class OportunidadeJpaAdapter implements OportunidadeRepositoryPort {

    private final OportunidadeJpaRepository jpa;
    private final OportunidadeMapper mapper;

    @Override
    public Oportunidade salvar(Oportunidade o) {
        try {
            OportunidadeEntity existing = jpa
                    .findByIdAndOrganizationId(o.id().value(), o.organizationId())
                    .orElse(null);
            OportunidadeEntity entity = mapper.toEntity(o, existing);
            OportunidadeEntity saved = jpa.saveAndFlush(entity);
            return mapper.toDomain(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrentModificationConflictException(
                    "Oportunidade modificada concorrentemente: " + o.id().asString(), ex);
        }
    }

    @Override
    public Optional<Oportunidade> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<Oportunidade> listar(UUID org, String estagio) {
        List<OportunidadeEntity> rows = (estagio == null || estagio.isBlank())
                ? jpa.findByOrganizationId(org)
                : jpa.findByOrganizationIdAndEstagio(org, estagio);
        return rows.stream().map(mapper::toDomain).toList();
    }
}
