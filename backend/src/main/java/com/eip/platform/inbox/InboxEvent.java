package com.eip.platform.inbox;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Inbox row used to deduplicate inbound events from external sources
 * (idempotent consumer pattern). The unique (source, external_event_id)
 * constraint guarantees each external event is processed at most once.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "inbox_event",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_inbox_source_external_event",
                columnNames = {"source", "external_event_id"}))
public class InboxEvent {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "source", nullable = false)
    private String source;

    @Column(name = "external_event_id", nullable = false)
    private String externalEventId;

    @Column(name = "payload_hash")
    private String payloadHash;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "received_at", nullable = false)
    private OffsetDateTime receivedAt;

    @Column(name = "processed_at")
    private OffsetDateTime processedAt;
}
