package com.eip.modules.crm.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.crm.domain.model.ClienteId;
import com.eip.modules.crm.domain.model.EstagioOportunidade;
import com.eip.modules.crm.domain.model.Oportunidade;
import com.eip.modules.crm.domain.model.OportunidadeId;

/**
 * Hand-written mapper between the opportunity aggregate and its JPA entity.
 */
@Component
public class OportunidadeMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public OportunidadeEntity toEntity(Oportunidade domain, OportunidadeEntity existing) {
        boolean isNew = existing == null;
        OportunidadeEntity entity = isNew ? new OportunidadeEntity() : existing;
        if (isNew) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setVersion(domain.version());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setClienteId(domain.clienteId() == null ? null : domain.clienteId().value());
        entity.setTitulo(domain.titulo());
        entity.setValorEstimado(domain.valorEstimado());
        entity.setMoeda(domain.moeda());
        entity.setEstagio(domain.estagio().name());
        entity.setProbabilidade(domain.probabilidade());
        entity.setFechamentoPrevisto(domain.fechamentoPrevisto());
        entity.setUpdatedAt(OffsetDateTime.now());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public Oportunidade toDomain(OportunidadeEntity entity) {
        return new Oportunidade(
                OportunidadeId.of(entity.getId()),
                entity.getOrganizationId(),
                entity.getClienteId() == null ? null : ClienteId.of(entity.getClienteId()),
                entity.getTitulo(),
                entity.getValorEstimado(),
                entity.getMoeda(),
                EstagioOportunidade.valueOf(entity.getEstagio()),
                entity.getProbabilidade(),
                entity.getFechamentoPrevisto(),
                entity.getVersion());
    }
}
