package com.eip.modules.superadmin.domain.port.in;

/**
 * Inbound port: record a product analytics event for the current tenant. The
 * organization is taken from the request-scoped context, so callers only pass
 * the event name and optional JSON properties.
 */
public interface RegistrarEventoUseCase {

    /**
     * Records a {@code product_event} for the current tenant.
     *
     * @param event      the event name (see {@code ProductEventName})
     * @param properties free-form JSON properties, may be {@code null}
     */
    void registrar(String event, String properties);
}
