package com.eip.platform.outbox;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Polls the transactional outbox and relays pending events.
 *
 * <p>Each poll claims a batch of due, unprocessed rows (row-locked via
 * {@code FOR UPDATE SKIP LOCKED} so multiple instances can run concurrently),
 * publishes an in-process {@link OutboxDispatched} event for each, and marks the
 * row processed. A row that fails to dispatch has its attempt counter and last
 * error updated and is retried on a subsequent poll.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxWorker {

    private static final int BATCH_SIZE = 50;

    private final OutboxRepository repository;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(fixedDelayString = "${eip.outbox.poll-ms:5000}")
    @Transactional
    public void poll() {
        List<OutboxEvent> batch = repository.findBatch(BATCH_SIZE);
        if (batch.isEmpty()) {
            return;
        }
        log.debug("Processando lote de outbox: {} evento(s)", batch.size());
        for (OutboxEvent event : batch) {
            dispatch(event);
        }
    }

    private void dispatch(OutboxEvent event) {
        try {
            eventPublisher.publishEvent(
                    new OutboxDispatched(event.getId(), event.getEventType(), event.getPayload()));
            event.setProcessedAt(OffsetDateTime.now());
            event.setLastError(null);
        } catch (RuntimeException ex) {
            event.setAttempts(event.getAttempts() + 1);
            event.setLastError(truncateError(ex.getMessage()));
            log.warn("Falha ao despachar evento outbox id={} tentativa={}",
                    event.getId(), event.getAttempts(), ex);
        }
        repository.save(event);
    }

    private static String truncateError(String message) {
        if (message == null) {
            return "unknown error";
        }
        return message.length() <= 1000 ? message : message.substring(0, 1000);
    }
}
