package com.eip.modules.bi.application;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Small internal helper shared by the BI application services: minimal JSON
 * payload construction for the transactional outbox.
 */
final class BiEvents {

    private BiEvents() {
    }

    /** Builds a minimal JSON event payload. */
    static String payload(String idField, UUID id, UUID org) {
        return "{\"" + idField + "\":\"" + id + "\",\"organizationId\":\"" + org
                + "\",\"occurredAt\":\"" + OffsetDateTime.now() + "\"}";
    }
}
