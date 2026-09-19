package com.eip.modules.export.domain.event;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Emitted when an export is confirmed.
 */
public record ExportacaoConfirmada(UUID exportId, UUID organizationId, OffsetDateTime occurredAt) {
}
