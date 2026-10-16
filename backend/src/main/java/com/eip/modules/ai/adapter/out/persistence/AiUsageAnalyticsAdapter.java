package com.eip.modules.ai.adapter.out.persistence;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import com.eip.modules.ai.adapter.out.persistence.AiUsageEventJpaRepository.CapabilityAggregateProjection;
import com.eip.modules.ai.adapter.out.persistence.AiUsageEventJpaRepository.RecentFailureProjection;
import com.eip.modules.ai.domain.port.out.AiUsageAnalyticsPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter that aggregates the tenant-scoped {@code ai_usage_event}
 * ledger into capability-level observability signals, backing
 * {@link AiUsageAnalyticsPort} (Req 13.2–13.5, 13.7).
 *
 * <p>Delegates to portable JPQL projections on
 * {@link AiUsageEventJpaRepository}; RLS restricts rows to the current tenant.
 */
@Component
@RequiredArgsConstructor
public class AiUsageAnalyticsAdapter implements AiUsageAnalyticsPort {

    private final AiUsageEventJpaRepository jpa;

    @Override
    public List<CapabilityAggregate> aggregateByOperation(OffsetDateTime since) {
        return jpa.aggregateByOperation(since).stream()
                .map(AiUsageAnalyticsAdapter::toAggregate)
                .toList();
    }

    @Override
    public List<RecentFailure> recentFailures(int limit) {
        return jpa.recentFailures(PageRequest.of(0, Math.max(limit, 0))).stream()
                .map(p -> new RecentFailure(p.getOperation(), p.getAt(), p.getFailureCategory()))
                .toList();
    }

    private static CapabilityAggregate toAggregate(CapabilityAggregateProjection p) {
        // AVG(latencyMs) is null when no rows carry latency; coerce null → 0 and
        // round to the nearest long.
        long avgLatencyMs = p.getAvgLatencyMs() == null
                ? 0L
                : Math.round(p.getAvgLatencyMs());
        // COALESCE in JPQL already yields 0 instead of null, but guard anyway.
        BigDecimal totalCost = p.getTotalCost() == null ? BigDecimal.ZERO : p.getTotalCost();
        // avgConfidence is ALWAYS null here: ai_usage_event has no confidence
        // column, so there is no persisted accuracy signal to aggregate. The usage
        // layer (task 12.3) decides which capabilities expose accuracy; absent a
        // persisted signal it returns null → UI "n/a".
        return new CapabilityAggregate(
                p.getOperation(),
                p.getRequests(),
                avgLatencyMs,
                totalCost,
                p.getFailures(),
                null,
                p.getLastEventAt());
    }
}
