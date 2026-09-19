package com.eip.modules.ai.domain.model;

import java.util.UUID;

/**
 * An AI request as seen by the gateway: what to do ({@code task}), the input
 * payload and the tenant/user it belongs to.
 *
 * @param task           the operation to perform
 * @param input          the raw input (text/document reference)
 * @param organizationId the owning tenant
 * @param userId         the requesting user, or {@code null} when unattributed
 */
public record AiRequest(AiTask task, String input, UUID organizationId, UUID userId) {
}
