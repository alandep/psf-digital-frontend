package com.eip.modules.superadmin.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.superadmin.domain.model.ProductEvent;
import com.eip.modules.superadmin.domain.port.in.ConsultarEventosUseCase.EventTypeCount;
import com.eip.modules.superadmin.domain.port.out.ProductEventRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link ProductEventRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class ProductEventJpaAdapter implements ProductEventRepositoryPort {

    private final ProductEventJpaRepository jpa;

    @Override
    public void save(ProductEvent e) {
        ProductEventEntity entity = new ProductEventEntity();
        entity.setId(e.id());
        entity.setOrganizationId(e.organizationId());
        entity.setUserId(e.userId());
        entity.setEvent(e.event());
        entity.setProperties(e.properties());
        entity.setOccurredAt(e.occurredAt());
        jpa.saveAndFlush(entity);
    }

    @Override
    public List<ProductEvent> list(UUID org, String event) {
        List<ProductEventEntity> rows = (event == null || event.isBlank())
                ? jpa.findByOrganizationIdOrderByOccurredAtDesc(org)
                : jpa.findByOrganizationIdAndEventOrderByOccurredAtDesc(org, event);
        return rows.stream().map(ProductEventJpaAdapter::toDomain).toList();
    }

    @Override
    public List<EventTypeCount> countByType(UUID org) {
        return jpa.countByType(org).stream()
                .map(r -> new EventTypeCount(r.getEvent(), r.getTotal()))
                .toList();
    }

    private static ProductEvent toDomain(ProductEventEntity e) {
        return new ProductEvent(
                e.getId(),
                e.getOrganizationId(),
                e.getUserId(),
                e.getEvent(),
                e.getProperties(),
                e.getOccurredAt());
    }
}
