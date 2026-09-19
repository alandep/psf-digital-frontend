package com.eip.modules.superadmin.domain.port.out;

import java.util.List;
import java.util.UUID;

import com.eip.modules.superadmin.domain.model.ProductEvent;
import com.eip.modules.superadmin.domain.port.in.ConsultarEventosUseCase.EventTypeCount;

/**
 * Outbound port: persistence for the tenant-scoped {@code product_event}
 * ledger.
 */
public interface ProductEventRepositoryPort {

    /** Persists a new product event. */
    void save(ProductEvent e);

    /**
     * Lists events for a tenant, optionally filtered by event name.
     *
     * @param event event name filter, or {@code null}/blank for all
     */
    List<ProductEvent> list(UUID org, String event);

    /** Counts events grouped by event name for a tenant. */
    List<EventTypeCount> countByType(UUID org);
}
