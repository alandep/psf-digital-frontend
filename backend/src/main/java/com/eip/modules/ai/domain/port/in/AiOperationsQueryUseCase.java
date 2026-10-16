package com.eip.modules.ai.domain.port.in;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Inbound port for the AI Operations Center observability panel (Req 13.1–13.10).
 *
 * <p>Exposes capability-level metrics derived from the tenant-scoped
 * {@code ai_usage_event} ledger and the most recent failures, mapping real
 * {@code AiTask} operations to the views the front renders. The queries are
 * read-only and RLS-scoped to the current organization.
 */
public interface AiOperationsQueryUseCase {

    /**
     * Capability metrics aggregated over the requested time window.
     *
     * @param window the aggregation window
     * @return one view per observed capability
     */
    List<CapabilityMetricView> capabilityMetrics(MetricsWindow window);

    /**
     * The most recent AI failures across all capabilities, newest first.
     *
     * @param limit the maximum number of failures to return
     * @return the latest errors for the errors panel
     */
    List<AiErrorView> recentErrors(int limit);

    /**
     * A capability row for the operations dashboard.
     *
     * <p><b>accuracy</b> is only meaningful for {@code NCM_CLASSIFICATION} and
     * {@code OCR_DOCUMENT} (the capabilities with a confidence signal). Since no
     * confidence is persisted in {@code ai_usage_event} today, it is always
     * {@code null} and the UI renders "n/a".
     *
     * @param capability        the operation key ({@code AiTask.name()})
     * @param label             a friendly label for the capability
     * @param requests          total number of requests in the window
     * @param avgResponseTimeMs average latency in milliseconds
     * @param cost              total provider cost in the window
     * @param accuracy          average confidence (always {@code null} today)
     * @param status            derived capability status
     *                          (ACTIVE/DEGRADED/OFFLINE/MAINTENANCE)
     * @param lastError         last error category, or {@code null}
     * @param lastErrorAt       time of the last error, or {@code null}
     */
    record CapabilityMetricView(String capability, String label, long requests,
            long avgResponseTimeMs, BigDecimal cost, Double accuracy,
            String status, String lastError, OffsetDateTime lastErrorAt) {
    }

    /**
     * A single recent error row for the errors panel.
     *
     * @param capability the operation key ({@code AiTask.name()})
     * @param at         the event time
     * @param category   the failure category
     * @param detail     an optional detail (may equal {@code category})
     */
    record AiErrorView(String capability, OffsetDateTime at, String category, String detail) {
    }

    /** The supported aggregation windows. */
    enum MetricsWindow {
        LAST_24H,
        LAST_7D
    }
}
