package com.eip.modules.finance.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.finance.domain.model.CambioContrato;
import com.eip.modules.finance.domain.model.CambioId;
import com.eip.modules.finance.domain.model.CambioStatus;
import com.eip.modules.finance.domain.model.CambioTipo;

/**
 * Hand-written mapper between the FX contract aggregate and its JPA entity.
 */
@Component
public class CambioContratoMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public CambioContratoEntity toEntity(CambioContrato domain, CambioContratoEntity existing) {
        boolean isNew = existing == null;
        CambioContratoEntity entity = isNew ? new CambioContratoEntity() : existing;
        if (isNew) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setVersion(domain.version());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setBanco(domain.banco());
        entity.setMoeda(domain.moeda());
        entity.setValor(domain.valor());
        entity.setTaxa(domain.taxa());
        entity.setTipo(domain.tipo() == null ? null : domain.tipo().name());
        entity.setStatus(domain.status().name());
        entity.setDataContratacao(domain.dataContratacao());
        entity.setDataLiquidacao(domain.dataLiquidacao());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public CambioContrato toDomain(CambioContratoEntity entity) {
        return new CambioContrato(
                CambioId.of(entity.getId()),
                entity.getOrganizationId(),
                entity.getBanco(),
                entity.getMoeda(),
                entity.getValor(),
                entity.getTaxa(),
                entity.getTipo() == null ? null : CambioTipo.valueOf(entity.getTipo()),
                CambioStatus.valueOf(entity.getStatus()),
                entity.getDataContratacao(),
                entity.getDataLiquidacao(),
                entity.getVersion());
    }
}
