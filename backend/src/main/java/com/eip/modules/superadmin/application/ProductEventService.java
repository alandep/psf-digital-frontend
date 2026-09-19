package com.eip.modules.superadmin.application;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.superadmin.domain.model.ProductEvent;
import com.eip.modules.superadmin.domain.model.ProductEventName;
import com.eip.modules.superadmin.domain.port.in.ConsultarEventosUseCase;
import com.eip.modules.superadmin.domain.port.in.RegistrarEventoUseCase;
import com.eip.modules.superadmin.domain.port.out.ProductEventRepositoryPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service for the tenant-scoped product analytics ledger. Writes
 * are transactional and emit an outbox event; reads are read-only. The
 * organization is always taken from the request-scoped context (normal
 * per-tenant RLS applies here).
 */
@Service
@RequiredArgsConstructor
public class ProductEventService implements RegistrarEventoUseCase, ConsultarEventosUseCase {

    private final ProductEventRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional
    public void registrar(String event, String properties) {
        if (event == null || event.isBlank()) {
            throw new BusinessRuleException("Campo obrigatorio: event");
        }
        String name = event.trim().toUpperCase();
        // Validate against the canonical catalog of product events.
        try {
            ProductEventName.valueOf(name);
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException("Evento invalido: " + event);
        }
        UUID org = currentOrg();
        ProductEvent e = new ProductEvent(
                UUID.randomUUID(), org, null, name, properties, OffsetDateTime.now());
        repo.save(e);
        outbox.record("ProductEvent", e.id().toString(), org, "ProductEventRegistrado",
                "{\"productEventId\":\"" + e.id() + "\",\"event\":\"" + name
                        + "\",\"organizationId\":\"" + org + "\"}");
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductEventView> eventos(String event) {
        UUID org = currentOrg();
        String filter = (event == null || event.isBlank()) ? null : event.trim().toUpperCase();
        return repo.list(org, filter).stream().map(ProductEventView::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventTypeCount> contagemPorTipo() {
        return repo.countByType(currentOrg());
    }
}
