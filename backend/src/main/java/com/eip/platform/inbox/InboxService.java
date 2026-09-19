package com.eip.platform.inbox;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Idempotent consumer support: records inbound external events and detects
 * duplicates so downstream processing runs at most once per external event.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InboxService {

    private static final String STATUS_RECEIVED = "RECEIVED";
    private static final String STATUS_PROCESSED = "PROCESSED";

    private final InboxRepository repository;

    /**
     * Records the arrival of an external event exactly once.
     *
     * @return {@code true} if this is the first time the event is seen (caller
     *         should process it); {@code false} if it is a duplicate.
     */
    public boolean receiveOnce(String source, String externalEventId, String payloadHash) {
        if (repository.existsBySourceAndExternalEventId(source, externalEventId)) {
            log.debug("Evento duplicado ignorado source={} externalEventId={}", source, externalEventId);
            return false;
        }
        InboxEvent event = new InboxEvent();
        event.setId(UUID.randomUUID());
        event.setSource(source);
        event.setExternalEventId(externalEventId);
        event.setPayloadHash(payloadHash);
        event.setStatus(STATUS_RECEIVED);
        event.setReceivedAt(OffsetDateTime.now());
        repository.save(event);
        return true;
    }

    /** Marks a previously received event as processed. */
    public void markProcessed(String source, String externalEventId) {
        repository.findBySourceAndExternalEventId(source, externalEventId).ifPresent(event -> {
            event.setStatus(STATUS_PROCESSED);
            event.setProcessedAt(OffsetDateTime.now());
            repository.save(event);
        });
    }
}
