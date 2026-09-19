package com.eip.modules.logistics.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.logistics.domain.model.Container;
import com.eip.modules.logistics.domain.model.Embarque;
import com.eip.modules.logistics.domain.model.EmbarqueId;
import com.eip.modules.logistics.domain.model.EmbarqueStatus;

/**
 * Hand-written mapper between the shipment domain aggregate and JPA entities.
 */
@Component
public class EmbarqueMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public EmbarqueEntity toEntity(Embarque domain, EmbarqueEntity existing) {
        EmbarqueEntity entity = existing != null ? existing : new EmbarqueEntity();
        boolean isNew = existing == null;
        if (isNew) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setVersion(domain.version());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setExportId(domain.exportId());
        entity.setReference(domain.reference());
        entity.setStatus(domain.status().name());
        entity.setPortoOrigemId(domain.portoOrigemId());
        entity.setPortoDestinoId(domain.portoDestinoId());
        entity.setNavioId(domain.navioId());
        entity.setTransportadoraId(domain.transportadoraId());
        entity.setEtd(domain.etd());
        entity.setEta(domain.eta());
        entity.setModal(domain.modal());
        entity.setUpdatedAt(OffsetDateTime.now());
        syncContainers(domain, entity);
        return entity;
    }

    private void syncContainers(Embarque domain, EmbarqueEntity entity) {
        // Replace-all strategy: orphanRemoval clears previous rows, domain
        // containers are re-inserted.
        entity.getContainers().clear();
        for (Container container : domain.containers()) {
            ContainerEntity containerEntity = new ContainerEntity();
            containerEntity.setId(container.id() != null ? container.id() : UUID.randomUUID());
            containerEntity.setEmbarque(entity);
            containerEntity.setOrganizationId(domain.organizationId());
            containerEntity.setNumero(container.numero());
            containerEntity.setTipo(container.tipo());
            containerEntity.setTara(container.tara());
            entity.getContainers().add(containerEntity);
        }
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public Embarque toDomain(EmbarqueEntity entity) {
        List<Container> containers = new ArrayList<>();
        for (ContainerEntity c : entity.getContainers()) {
            containers.add(new Container(
                    c.getId(),
                    c.getNumero(),
                    c.getTipo(),
                    c.getTara()));
        }
        return new Embarque(
                EmbarqueId.of(entity.getId()),
                entity.getOrganizationId(),
                entity.getExportId(),
                entity.getReference(),
                EmbarqueStatus.valueOf(entity.getStatus()),
                entity.getPortoOrigemId(),
                entity.getPortoDestinoId(),
                entity.getNavioId(),
                entity.getTransportadoraId(),
                entity.getEtd(),
                entity.getEta(),
                entity.getModal(),
                entity.getVersion(),
                containers);
    }
}
