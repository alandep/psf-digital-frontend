package com.eip.modules.finance.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.finance.domain.model.HedgeContrato;
import com.eip.modules.finance.domain.model.HedgeId;
import com.eip.modules.finance.domain.model.HedgeInstrumento;
import com.eip.modules.finance.domain.model.HedgeStatus;

/**
 * Hand-written mapper between the hedge contract aggregate and its JPA entity.
 */
@Component
public class HedgeContratoMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public HedgeContratoEntity toEntity(HedgeContrato domain, HedgeContratoEntity existing) {
        boolean isNew = existing == null;
        HedgeContratoEntity entity = isNew ? new HedgeContratoEntity() : existing;
        if (isNew) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setVersion(domain.version());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setInstrumento(domain.instrumento() == null ? null : domain.instrumento().name());
        entity.setMoeda(domain.moeda());
        entity.setNotional(domain.notional());
        entity.setStrike(domain.strike());
        entity.setVencimento(domain.vencimento());
        entity.setStatus(domain.status().name());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public HedgeContrato toDomain(HedgeContratoEntity entity) {
        return new HedgeContrato(
                HedgeId.of(entity.getId()),
                entity.getOrganizationId(),
                entity.getInstrumento() == null
                        ? null : HedgeInstrumento.valueOf(entity.getInstrumento()),
                entity.getMoeda(),
                entity.getNotional(),
                entity.getStrike(),
                entity.getVencimento(),
                HedgeStatus.valueOf(entity.getStatus()),
                entity.getVersion());
    }
}
