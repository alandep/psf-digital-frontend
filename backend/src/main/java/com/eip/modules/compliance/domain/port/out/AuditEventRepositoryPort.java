package com.eip.modules.compliance.domain.port.out;

import java.util.List;
import java.util.UUID;

import com.eip.modules.compliance.domain.model.AuditEvent;

/**
 * Outbound port: read access to the append-only audit trail.
 */
public interface AuditEventRepositoryPort {

    List<AuditEvent> listar(UUID org, String resourceType, int limit);
}
