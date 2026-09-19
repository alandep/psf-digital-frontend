package com.eip.modules.export.domain.event;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Emitted when a new export draft is created.
 */
public record ExportacaoCriada(UUID exportId, UUID organizationId, OffsetDateTime occurredAt) {
}
