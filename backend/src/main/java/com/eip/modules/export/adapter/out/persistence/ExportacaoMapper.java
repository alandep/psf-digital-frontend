package com.eip.modules.export.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.export.domain.model.Exportacao;
import com.eip.modules.export.domain.model.ExportacaoId;
import com.eip.modules.export.domain.model.ExportacaoStatus;
import com.eip.modules.export.domain.model.ItemExportacao;

/**
 * Hand-written mapper between the export domain aggregate and JPA entities.
 */
@Component
public class ExportacaoMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public ExportacaoEntity toEntity(Exportacao domain, ExportacaoEntity existing) {
        ExportacaoEntity entity = existing != null ? existing : new ExportacaoEntity();
        boolean isNew = existing == null;
        if (isNew) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setVersion(domain.version());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setLegalEntityId(domain.legalEntityId());
        entity.setCustomerId(domain.customerId());
        entity.setReference(domain.reference());
        entity.setStatus(domain.status().name());
        entity.setDestinationCountry(domain.destinationCountry());
        entity.setIncoterm(domain.incoterm());
        entity.setTotalAmount(domain.totalAmount());
        entity.setCurrency(domain.currency());
        entity.setUpdatedAt(OffsetDateTime.now());
        syncItens(domain, entity);
        return entity;
    }

    private void syncItens(Exportacao domain, ExportacaoEntity entity) {
        // Replace-all strategy: simple and correct for draft edits. orphanRemoval
        // clears the previous rows, the new domain items are re-inserted.
        entity.getItens().clear();
        for (ItemExportacao item : domain.itens()) {
            ExportItemEntity itemEntity = new ExportItemEntity();
            itemEntity.setId(item.id() != null ? item.id() : UUID.randomUUID());
            itemEntity.setExport(entity);
            itemEntity.setOrganizationId(domain.organizationId());
            itemEntity.setProductId(item.productId());
            itemEntity.setDescription(item.description());
            itemEntity.setQuantity(item.quantity());
            itemEntity.setUnitPrice(item.unitPrice());
            entity.getItens().add(itemEntity);
        }
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public Exportacao toDomain(ExportacaoEntity entity) {
        List<ItemExportacao> itens = new ArrayList<>();
        for (ExportItemEntity i : entity.getItens()) {
            itens.add(new ItemExportacao(
                    i.getId(),
                    i.getProductId(),
                    i.getDescription(),
                    i.getQuantity(),
                    i.getUnitPrice()));
        }
        return new Exportacao(
                ExportacaoId.of(entity.getId()),
                entity.getOrganizationId(),
                entity.getLegalEntityId(),
                entity.getCustomerId(),
                entity.getReference(),
                ExportacaoStatus.valueOf(entity.getStatus()),
                entity.getDestinationCountry(),
                entity.getIncoterm(),
                entity.getTotalAmount(),
                entity.getCurrency(),
                entity.getVersion(),
                itens);
    }
}
