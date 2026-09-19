package com.eip.modules.superadmin.domain.port.in;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.eip.modules.superadmin.domain.model.ProductEvent;

/**
 * Inbound port: read product analytics events for the current tenant.
 */
public interface ConsultarEventosUseCase {

    /**
     * Lists events for the current tenant, optionally filtered by event name.
     *
     * @param event event name filter, or {@code null}/blank for all
     */
    List<ProductEventView> eventos(String event);

    /** Event counts grouped by event name for the current tenant. */
    List<EventTypeCount> contagemPorTipo();

    /** Read view of a product event. */
    record ProductEventView(
            UUID id,
            String event,
            String properties,
            OffsetDateTime occurredAt) {

        public static ProductEventView from(ProductEvent e) {
            return new ProductEventView(e.id(), e.event(), e.properties(), e.occurredAt());
        }
    }

    /** Count of events for a given event name. */
    record EventTypeCount(String event, long count) {
    }
}
