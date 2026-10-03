package com.eip.modules.ai.domain.port.out;

import java.math.BigDecimal;
import java.util.UUID;

import com.eip.modules.ai.domain.model.AiLedgerEntry;
import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.model.AiTask;

/**
 * Outbound port for the authoritative AI usage ledger ({@code ai_usage_event}).
 * Every AI operation records one event feeding the tenant's franquia meters.
 *
 * <p>Two entry points coexist:
 * <ul>
 *   <li>{@link #record} — the legacy success-path meter: a flat signature that persists the
 *       aggregate telemetry of a successful call. Left untouched for the validated happy path;
 *       it leaves the outcome/failureCategory/traceId columns null.</li>
 *   <li>{@link #recordOutcome} — the richer outcome-aware entry: carries the call
 *       {@link com.eip.modules.ai.domain.model.AiOutcome} (ATTEMPT/SUCCESS/FAILURE/RETRY), an
 *       optional {@code failureCategory} and the propagated {@code traceId}, enabling end-to-end
 *       observability of failures and retries (Req 9.1, 9.2).</li>
 *   <li>{@link #recordFailureOutcome} — same as {@link #recordOutcome} but committed in a
 *       SEPARATE transaction so a FAILURE row survives the rollback of the caller's
 *       (rolling-back) transaction when the failing exception is rethrown (Req 9.2).</li>
 * </ul>
 */
public interface AiUsageLedgerPort {

    void record(UUID org, UUID userId, AiTask task, AiResult result, String requestId,
            BigDecimal providerCost);

    /**
     * Records an outcome-aware ledger entry. Handles a {@code null}
     * {@link AiLedgerEntry#result()} gracefully (pure FAILURE with no telemetry).
     *
     * @param entry the outcome-aware ledger entry
     */
    void recordOutcome(AiLedgerEntry entry);

    /**
     * Records a FAILURE outcome in a SEPARATE transaction ({@code REQUIRES_NEW}).
     *
     * <p>The AI call path is transactional and rethrows the failing exception so the HTTP layer
     * can map it to the right status; that rethrow rolls back the caller's transaction. If the
     * failure ledger insert shared that transaction it would be rolled back too, losing the
     * failure record. This method commits the FAILURE row independently so observability of
     * failures is preserved regardless of the caller's rollback (Req 9.2).
     *
     * @param entry the outcome-aware ledger entry (typically a pure FAILURE)
     */
    void recordFailureOutcome(AiLedgerEntry entry);
}
