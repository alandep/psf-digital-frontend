package com.eip.modules.compliance.domain.port.in;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.eip.modules.compliance.domain.model.AuditEvent;

/**
 * Inbound port: consult the append-only audit trail.
 */
public interface ConsultarAuditoriaUseCase {

    List<AuditView> listar(String resourceType);

    /** Read view of a single audit event. */
    record AuditView(
            UUID id,
            UUID actorId,
            String action,
            String resourceType,
            UUID resourceId,
            OffsetDateTime occurredAt) {

        public static AuditView from(AuditEvent e) {
            return new AuditView(
                    e.id(),
                    e.actorId(),
                    e.action(),
                    e.resourceType(),
                    e.resourceId(),
                    e.occurredAt());
        }
    }
}
