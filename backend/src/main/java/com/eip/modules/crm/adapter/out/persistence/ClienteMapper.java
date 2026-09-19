package com.eip.modules.crm.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.crm.domain.model.Cliente;
import com.eip.modules.crm.domain.model.ClienteId;
import com.eip.modules.crm.domain.model.ClienteStatus;

/**
 * Hand-written mapper between the customer aggregate and its JPA entity.
 */
@Component
public class ClienteMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public ClienteEntity toEntity(Cliente domain, ClienteEntity existing) {
        boolean isNew = existing == null;
        ClienteEntity entity = isNew ? new ClienteEntity() : existing;
        if (isNew) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setName(domain.name());
        entity.setCnpj(domain.cnpj());
        entity.setSegmento(domain.segmento());
        entity.setPais(domain.pais());
        entity.setStatus(domain.status().name());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public Cliente toDomain(ClienteEntity entity) {
        return new Cliente(
                ClienteId.of(entity.getId()),
                entity.getOrganizationId(),
                entity.getName(),
                entity.getCnpj(),
                entity.getSegmento(),
                entity.getPais(),
                ClienteStatus.valueOf(entity.getStatus()));
    }
}
