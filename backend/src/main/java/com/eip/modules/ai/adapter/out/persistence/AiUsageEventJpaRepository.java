package com.eip.modules.ai.adapter.out.persistence;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for {@link AiUsageEventEntity}.
 */
public interface AiUsageEventJpaRepository extends JpaRepository<AiUsageEventEntity, UUID> {

    /**
     * Aggregates events by {@code operation} over the window starting at
     * {@code since} (inclusive). Portable JPQL (no native SQL); RLS already
     * restricts rows to the current tenant.
     *
     * <ul>
     *   <li>{@code requests} = {@code COUNT(e)}</li>
     *   <li>{@code avgLatencyMs} = {@code AVG(latencyMs)} (null when no latency;
     *       the adapter coerces null → 0 and rounds to long)</li>
     *   <li>{@code totalCost} = {@code COALESCE(SUM(providerCost), 0)}</li>
     *   <li>{@code failures} = count of rows with {@code outcome = 'FAILURE'}</li>
     *   <li>{@code lastEventAt} = {@code MAX(createdAt)}</li>
     * </ul>
     *
     * @param since inclusive lower bound of the aggregation window
     * @return one projection row per distinct operation
     */
    @Query("""
            SELECT e.operation AS operation,
                   COUNT(e) AS requests,
                   AVG(e.latencyMs) AS avgLatencyMs,
                   COALESCE(SUM(e.providerCost), 0) AS totalCost,
                   SUM(CASE WHEN e.outcome = 'FAILURE' THEN 1L ELSE 0L END) AS failures,
                   MAX(e.createdAt) AS lastEventAt
            FROM AiUsageEventEntity e
            WHERE e.createdAt >= :since
            GROUP BY e.operation
            """)
    List<CapabilityAggregateProjection> aggregateByOperation(@Param("since") OffsetDateTime since);

    /**
     * Returns the most recent FAILURE rows, newest first. Pass a
     * {@code PageRequest.of(0, limit)} to cap the result size.
     *
     * @param pageable paging/limit control (page 0, size = desired limit)
     * @return the latest failures ordered by {@code createdAt} descending
     */
    @Query("""
            SELECT e.operation AS operation,
                   e.createdAt AS at,
                   e.failureCategory AS failureCategory
            FROM AiUsageEventEntity e
            WHERE e.outcome = 'FAILURE'
            ORDER BY e.createdAt DESC
            """)
    List<RecentFailureProjection> recentFailures(Pageable pageable);

    /** Projection for {@link #aggregateByOperation(OffsetDateTime)}. */
    interface CapabilityAggregateProjection {
        String getOperation();

        long getRequests();

        Double getAvgLatencyMs();

        BigDecimal getTotalCost();

        long getFailures();

        OffsetDateTime getLastEventAt();
    }

    /** Projection for {@link #recentFailures(Pageable)}. */
    interface RecentFailureProjection {
        String getOperation();

        OffsetDateTime getAt();

        String getFailureCategory();
    }
}
