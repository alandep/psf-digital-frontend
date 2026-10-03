package com.eip.modules.ai.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * An outcome-aware entry for the AI usage ledger ({@code ai_usage_event}).
 *
 * <p>Richer than the legacy success-path meter: besides the tenant/user/task identity it
 * carries the call {@link AiOutcome} (ATTEMPT/SUCCESS/FAILURE/RETRY), an optional failure
 * category and the propagated {@code traceId} for end-to-end observability (Req 9.1, 9.2).
 *
 * <p>Nullability:
 * <ul>
 *   <li>{@code failureCategory} is {@code null} for SUCCESS/ATTEMPT outcomes and set only on
 *       FAILURE/RETRY (e.g. TIMEOUT, RATE_LIMITED, PROVIDER_5XX, RESPONSE_INVALID);</li>
 *   <li>{@code traceId} is {@code null} when the UI did not propagate one;</li>
 *   <li>{@code result} may be {@code null} for a pure FAILURE with no provider telemetry — the
 *       adapter MUST persist outcome/failureCategory/traceId with zeroed/absent telemetry rather
 *       than dereferencing a null result;</li>
 *   <li>{@code providerCost} may be {@code null} when the FinOps cost is unknown/not applicable.</li>
 * </ul>
 *
 * <p>Redaction (Req 9.6, 11.4): {@code AiResult.output} is NEVER persisted — only aggregate
 * telemetry is stored.
 *
 * @param org             the tenant organization id
 * @param userId          the acting user id (nullable)
 * @param task            the AI operation performed
 * @param requestId       the request correlation id
 * @param traceId         the propagated {@code X-Trace-Id} (nullable)
 * @param outcome         the call outcome (ATTEMPT/SUCCESS/FAILURE/RETRY)
 * @param failureCategory the failure category, {@code null} for SUCCESS/ATTEMPT
 * @param result          the aggregate telemetry, {@code null} for a pure FAILURE
 * @param providerCost    the FinOps provider cost (nullable)
 */
public record AiLedgerEntry(
        UUID org,
        UUID userId,
        AiTask task,
        String requestId,
        String traceId,
        AiOutcome outcome,
        String failureCategory,
        AiResult result,
        BigDecimal providerCost) {
}
