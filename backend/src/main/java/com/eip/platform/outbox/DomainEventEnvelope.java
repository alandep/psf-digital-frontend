package com.eip.platform.outbox;

import java.util.UUID;

/**
 * Lightweight envelope describing a domain event to be published via the
 * transactional outbox.
 *
 * @param aggregateType the aggregate/entity type (e.g. {@code "Order"})
 * @param aggregateId   the aggregate identifier as a string
 * @param organizationId the owning tenant
 * @param eventType     the event type (e.g. {@code "OrderPlaced"})
 * @param payload       the serialized event body (typically JSON)
 */
public record DomainEventEnvelope(String aggregateType, String aggregateId, UUID organizationId,
                                  String eventType, String payload) {
}
