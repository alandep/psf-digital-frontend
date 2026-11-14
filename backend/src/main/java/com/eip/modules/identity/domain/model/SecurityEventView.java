package com.eip.modules.identity.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Read model of a persisted security event (login, MFA, password, session...).
 *
 * @param id         event id
 * @param type       event type code (e.g. {@code LOGIN_SUCCEEDED})
 * @param ip         client IP recorded with the event (may be {@code null})
 * @param occurredAt when the event happened
 */
public record SecurityEventView(UUID id, String type, String ip, OffsetDateTime occurredAt) {
}
