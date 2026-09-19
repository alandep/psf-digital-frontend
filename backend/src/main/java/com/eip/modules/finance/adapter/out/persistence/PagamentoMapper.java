package com.eip.modules.finance.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.finance.domain.model.Pagamento;
import com.eip.modules.finance.domain.model.PagamentoId;
import com.eip.modules.finance.domain.model.PagamentoStatus;
import com.eip.modules.finance.domain.model.PagamentoTipo;

/**
 * Hand-written mapper between the payment aggregate and its JPA entity.
 */
@Component
public class PagamentoMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public PagamentoEntity toEntity(Pagamento domain, PagamentoEntity existing) {
        boolean isNew = existing == null;
        PagamentoEntity entity = isNew ? new PagamentoEntity() : existing;
        if (isNew) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setVersion(domain.version());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setExportId(domain.exportId());
        entity.setTipo(domain.tipo() == null ? null : domain.tipo().name());
        entity.setDescricao(domain.descricao());
        entity.setAmount(domain.amount());
        entity.setCurrency(domain.currency());
        entity.setStatus(domain.status().name());
        entity.setDueDate(domain.dueDate());
        entity.setPaidAt(domain.paidAt());
        entity.setUpdatedAt(OffsetDateTime.now());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public Pagamento toDomain(PagamentoEntity entity) {
        return new Pagamento(
                PagamentoId.of(entity.getId()),
                entity.getOrganizationId(),
                entity.getExportId(),
                entity.getTipo() == null ? null : PagamentoTipo.valueOf(entity.getTipo()),
                entity.getDescricao(),
                entity.getAmount(),
                entity.getCurrency(),
                PagamentoStatus.valueOf(entity.getStatus()),
                entity.getDueDate(),
                entity.getPaidAt(),
                entity.getVersion());
    }
}
