package com.eip.modules.superadmin.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * A single product analytics event (a row in the tenant-scoped
 * {@code product_event} ledger). Pure domain record.
 *
 * @param id             event identifier
 * @param organizationId owning tenant
 * @param userId         actor, may be {@code null} for system events
 * @param event          event name (see {@link ProductEventName})
 * @param properties     free-form JSON properties, may be {@code null}
 * @param occurredAt     when the event happened
 */
public record ProductEvent(
        UUID id,
        UUID organizationId,
        UUID userId,
        String event,
        String properties,
        OffsetDateTime occurredAt) {
}
