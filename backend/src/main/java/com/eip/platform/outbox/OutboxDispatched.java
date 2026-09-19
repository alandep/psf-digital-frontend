package com.eip.platform.outbox;

import java.util.UUID;

/**
 * Spring {@code ApplicationEvent} published by the {@link OutboxWorker} when an
 * outbox row is dispatched. In-process listeners can subscribe to react to
 * domain events without coupling to the outbox storage details.
 *
 * @param outboxId  the id of the source outbox row
 * @param eventType the event type
 * @param payload   the serialized event body
 */
public record OutboxDispatched(UUID outboxId, String eventType, String payload) {
}
