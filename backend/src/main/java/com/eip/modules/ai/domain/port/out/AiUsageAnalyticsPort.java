package com.eip.modules.ai.domain.port.out;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Outbound read port that aggregates the tenant-scoped {@code ai_usage_event}
 * ledger into capability-level observability signals (Req 13.2–13.5, 13.7).
 *
 * <p>The underlying queries run in the tenant context, so Row-Level Security
 * already restricts every row to the current organization — no explicit
 * {@code organization_id} filter is applied here.
 */
public interface AiUsageAnalyticsPort {

    /**
     * Aggregates usage events by {@code operation} (= {@code AiTask.name()})
     * over the window starting at {@code since} (inclusive).
     *
     * @param since the lower bound of the aggregation window (inclusive)
     * @return one {@link CapabilityAggregate} per distinct operation observed
     */
    List<CapabilityAggregate> aggregateByOperation(OffsetDateTime since);

    /**
     * Returns the most recent FAILURE events across all operations, newest
     * first.
     *
     * @param limit the maximum number of failures to return
     * @return the latest failures, ordered by event time descending
     */
    List<RecentFailure> recentFailures(int limit);

    /**
     * Capability-level aggregate derived from the ledger for a single
     * {@code operation}.
     *
     * <p><b>avgConfidence is always {@code null} in the persistence adapter.</b>
     * The {@code ai_usage_event} table carries no confidence column, so there is
     * no persisted accuracy signal to aggregate. The usage layer (task 12.3)
     * decides to expose accuracy only for {@code NCM_CLASSIFICATION} and
     * {@code OCR_DOCUMENT}; absent a persisted signal it returns {@code null},
     * which the UI renders as "n/a".
     *
     * @param operation     the operation key ({@code AiTask.name()})
     * @param requests      total number of events ({@code COUNT(*)})
     * @param avgLatencyMs  average latency in ms, rounded to long (null → 0)
     * @param totalCost     sum of {@code provider_cost} ({@code COALESCE(..,0)})
     * @param failures      number of events with {@code outcome = 'FAILURE'}
     * @param avgConfidence average confidence; always {@code null} here (no
     *                      persisted confidence column)
     * @param lastEventAt   the most recent {@code created_at} for the operation
     */
    record CapabilityAggregate(
            String operation,
            long requests,
            long avgLatencyMs,
            BigDecimal totalCost,
            long failures,
            Double avgConfidence,
            OffsetDateTime lastEventAt) {
    }

    /**
     * A single recent FAILURE row projected for the errors panel.
     *
     * @param operation       the operation key ({@code AiTask.name()})
     * @param at              the event time ({@code created_at})
     * @param failureCategory the recorded failure category (may be {@code null})
     */
    record RecentFailure(String operation, OffsetDateTime at, String failureCategory) {
    }
}
