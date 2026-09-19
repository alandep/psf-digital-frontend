package com.eip.platform.idempotency;

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
 * Persistent record of a processed idempotent operation, keyed by
 * (organization, operation, idempotency key). Enforces at-most-once semantics
 * for retried client requests.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "idempotency_record",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_idempotency_org_operation_key",
                columnNames = {"organization_id", "operation", "idem_key"}))
public class IdempotencyRecord {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "idem_key", nullable = false)
    private String idemKey;

    @Column(name = "operation", nullable = false)
    private String operation;

    @Column(name = "request_hash", nullable = false)
    private String requestHash;

    @Column(name = "response_status", nullable = false)
    private int responseStatus;

    @Column(name = "response_body", columnDefinition = "text")
    private String responseBody;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;
}
