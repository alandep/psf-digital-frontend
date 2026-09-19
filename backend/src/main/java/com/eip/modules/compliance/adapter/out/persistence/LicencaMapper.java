package com.eip.modules.compliance.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.compliance.domain.model.Licenca;
import com.eip.modules.compliance.domain.model.LicencaId;
import com.eip.modules.compliance.domain.model.LicencaStatus;

/**
 * Hand-written mapper between the license aggregate and its JPA entity.
 */
@Component
public class LicencaMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public LicencaEntity toEntity(Licenca domain, LicencaEntity existing) {
        boolean isNew = existing == null;
        LicencaEntity entity = isNew ? new LicencaEntity() : existing;
        if (isNew) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setVersion(domain.version());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setName(domain.name());
        entity.setTipo(domain.tipo());
        entity.setOrgao(domain.orgao());
        entity.setNumero(domain.numero());
        entity.setStatus(domain.status().name());
        entity.setEmitidaEm(domain.emitidaEm());
        entity.setValidaAte(domain.validaAte());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public Licenca toDomain(LicencaEntity entity) {
        return new Licenca(
                LicencaId.of(entity.getId()),
                entity.getOrganizationId(),
                entity.getName(),
                entity.getTipo(),
                entity.getOrgao(),
                entity.getNumero(),
                LicencaStatus.valueOf(entity.getStatus()),
                entity.getEmitidaEm(),
                entity.getValidaAte(),
                entity.getVersion());
    }
}
