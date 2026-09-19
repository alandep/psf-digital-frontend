package com.eip.modules.crm.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.crm.domain.model.Cliente;
import com.eip.modules.crm.domain.port.out.ClienteRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link ClienteRepositoryPort} over JPA.
 * The {@code crm_cliente} table has no optimistic-lock column, so there is no
 * concurrent-modification handling here.
 */
@Component
@RequiredArgsConstructor
public class ClienteJpaAdapter implements ClienteRepositoryPort {

    private final ClienteJpaRepository jpa;
    private final ClienteMapper mapper;

    @Override
    public Cliente salvar(Cliente c) {
        ClienteEntity existing = jpa
                .findByIdAndOrganizationId(c.id().value(), c.organizationId())
                .orElse(null);
        ClienteEntity entity = mapper.toEntity(c, existing);
        ClienteEntity saved = jpa.saveAndFlush(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Cliente> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<Cliente> listar(UUID org, String status) {
        List<ClienteEntity> rows = (status == null || status.isBlank())
                ? jpa.findByOrganizationId(org)
                : jpa.findByOrganizationIdAndStatus(org, status);
        return rows.stream().map(mapper::toDomain).toList();
    }
}
