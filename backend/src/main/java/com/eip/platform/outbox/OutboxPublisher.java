package com.eip.platform.outbox;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * Records domain events into the transactional outbox.
 *
 * <p>{@link #record} must be invoked within the same transaction as the state
 * change it accompanies so the event and the state are committed atomically.
 */
@Component
@RequiredArgsConstructor
public class OutboxPublisher {

    private final OutboxRepository repository;

    /**
     * Persists a new outbox event in the current transaction.
     *
     * @return the id of the persisted outbox row
     */
    public UUID record(String aggregateType, String aggregateId, UUID organizationId,
                       String eventType, String payload) {
        OffsetDateTime now = OffsetDateTime.now();
        OutboxEvent event = new OutboxEvent();
        event.setId(UUID.randomUUID());
        event.setAggregateType(aggregateType);
        event.setAggregateId(aggregateId);
        event.setOrganizationId(organizationId);
        event.setEventType(eventType);
        event.setPayload(payload);
        event.setOccurredAt(now);
        event.setAvailableAt(now);
        event.setAttempts(0);
        repository.save(event);
        return event.getId();
    }

    /** Convenience overload accepting a {@link DomainEventEnvelope}. */
    public UUID record(DomainEventEnvelope envelope) {
        return record(envelope.aggregateType(), envelope.aggregateId(), envelope.organizationId(),
                envelope.eventType(), envelope.payload());
    }
}
