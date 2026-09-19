package com.eip.modules.compliance.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Read-only projection of an append-only audit trail event.
 */
public record AuditEvent(
        UUID id,
        UUID organizationId,
        UUID actorId,
        String action,
        String resourceType,
        UUID resourceId,
        OffsetDateTime occurredAt) {
}
