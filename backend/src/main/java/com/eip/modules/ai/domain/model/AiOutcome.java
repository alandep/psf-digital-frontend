package com.eip.modules.ai.domain.model;

/**
 * The outcome of an AI call as recorded in the usage ledger ({@code ai_usage_event}).
 *
 * <p>Distinguishes a mere attempt from its terminal result and from a retry step, so
 * observability (Req 9.2) can tell apart a successful call, a definitive failure and the
 * transient retries that preceded a success:
 * <ul>
 *   <li>{@code ATTEMPT} — a call was started (telemetry may be partial/absent);</li>
 *   <li>{@code SUCCESS} — the call completed successfully;</li>
 *   <li>{@code FAILURE} — the call failed definitively (see {@code failureCategory});</li>
 *   <li>{@code RETRY}   — a transient failure that triggered a retry before a later outcome.</li>
 * </ul>
 */
public enum AiOutcome {
    ATTEMPT,
    SUCCESS,
    FAILURE,
    RETRY
}
