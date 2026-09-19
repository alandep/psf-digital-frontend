package com.eip.modules.cms.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.cms.domain.model.Advertiser;
import com.eip.modules.cms.domain.model.AdvertiserStatus;

/**
 * Hand-written mapper between the {@link Advertiser} record and its entity.
 */
@Component
public class AdvertiserMapper {

    /**
     * Maps a domain record to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public AdvertiserEntity toEntity(Advertiser domain, AdvertiserEntity existing) {
        boolean isNew = existing == null;
        AdvertiserEntity entity = isNew ? new AdvertiserEntity() : existing;
        if (isNew) {
            entity.setId(domain.id());
            entity.setCreatedAt(OffsetDateTime.now());
        }
        entity.setLegalName(domain.legalName());
        entity.setTradeName(domain.tradeName());
        entity.setCnpj(domain.cnpj());
        entity.setWebsite(domain.website());
        entity.setStatus(domain.status() == null ? null : domain.status().name());
        return entity;
    }

    /** Maps a persisted entity back to the domain record. */
    public Advertiser toDomain(AdvertiserEntity entity) {
        return new Advertiser(
                entity.getId(),
                entity.getLegalName(),
                entity.getTradeName(),
                entity.getCnpj(),
                entity.getWebsite(),
                entity.getStatus() == null ? null : AdvertiserStatus.valueOf(entity.getStatus()));
    }
}
