package com.eip.modules.ai.application;

import org.springframework.stereotype.Component;

/**
 * Deterministic, stateless derivation of {@code Status_Capacidade} from a
 * capability's observability signals (Req 13.6).
 *
 * <p>The method is a pure function of its inputs: the same signals always yield
 * the same status, with no side effects and no I/O. Thresholds are named
 * constants.
 *
 * <p>Rules, evaluated in order:
 * <ol>
 *   <li><b>MAINTENANCE</b> — the task is disabled in the router
 *       ({@code ai_model_config}): {@code !enabledInRouter}.</li>
 *   <li><b>OFFLINE</b> — no successful execution and at least one failure:
 *       {@code successes == 0 && failures >= 1} (where
 *       {@code successes = requests - failures}).</li>
 *   <li><b>DEGRADED</b> — the failure ratio exceeds
 *       {@value #FAILURE_RATIO_THRESHOLD} (20%) OR average latency exceeds
 *       {@value #LATENCY_THRESHOLD_MS} ms.</li>
 *   <li><b>ACTIVE</b> — otherwise.</li>
 * </ol>
 */
@Component
public class CapabilityStatusResolver {

    /** Capability status: task disabled in the router. */
    public static final String MAINTENANCE = "MAINTENANCE";
    /** Capability status: no success and at least one failure. */
    public static final String OFFLINE = "OFFLINE";
    /** Capability status: failure ratio or latency above threshold. */
    public static final String DEGRADED = "DEGRADED";
    /** Capability status: healthy. */
    public static final String ACTIVE = "ACTIVE";

    /** Failure ratio above which a capability is considered DEGRADED (20%). */
    static final double FAILURE_RATIO_THRESHOLD = 0.2;
    /** Average latency (ms) above which a capability is considered DEGRADED. */
    static final long LATENCY_THRESHOLD_MS = 5000L;

    /**
     * Resolves the capability status from its aggregated signals.
     *
     * @param requests        total number of events in the window
     * @param failures        number of FAILURE events in the window
     * @param avgLatencyMs    average latency in milliseconds
     * @param enabledInRouter whether the task is enabled in {@code ai_model_config}
     * @return one of {@link #MAINTENANCE}, {@link #OFFLINE}, {@link #DEGRADED}
     *         or {@link #ACTIVE}
     */
    public String resolve(long requests, long failures, long avgLatencyMs, boolean enabledInRouter) {
        if (!enabledInRouter) {
            return MAINTENANCE;
        }
        long successes = requests - failures;
        if (successes <= 0 && failures >= 1) {
            return OFFLINE;
        }
        double failureRatio = requests > 0 ? (double) failures / requests : 0.0;
        if (failureRatio > FAILURE_RATIO_THRESHOLD || avgLatencyMs > LATENCY_THRESHOLD_MS) {
            return DEGRADED;
        }
        return ACTIVE;
    }
}
