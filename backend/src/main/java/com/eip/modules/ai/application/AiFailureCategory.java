package com.eip.modules.ai.application;

import com.eip.modules.ai.domain.error.AiDefinitiveProviderException;
import com.eip.modules.ai.domain.error.AiProviderUnavailableException;
import com.eip.modules.ai.domain.error.AiRateLimitedException;
import com.eip.modules.ai.domain.error.AiResponseException;
import com.eip.modules.ai.domain.error.AiTimeoutException;
import com.eip.modules.ai.domain.error.AiTransientProviderException;
import com.eip.platform.error.BusinessRuleException;

/**
 * Maps a {@link Throwable} to a stable {@code failureCategory} string used in the AI usage
 * ledger ({@code ai_usage_event.failure_category}) and in structured logs (Req 9.2, 9.3).
 *
 * <p>The returned category is a short, enumerated token (never a free-form message), so it is
 * safe to persist and aggregate. The mapping is deterministic and keyed only on the exception
 * type — it never inspects message text or payloads, so no sensitive content (bearer token,
 * document text) can leak through this helper (Req 9.6, 11.4).
 *
 * <p>Mapping:
 * <ul>
 *   <li>{@link AiTimeoutException} &rarr; {@code TIMEOUT};</li>
 *   <li>{@link AiRateLimitedException} &rarr; {@code RATE_LIMITED};</li>
 *   <li>{@link AiProviderUnavailableException} &rarr; {@code PROVIDER_UNAVAILABLE};</li>
 *   <li>{@link AiTransientProviderException} &rarr; {@code PROVIDER_5XX};</li>
 *   <li>{@link AiDefinitiveProviderException} &rarr; {@code PROVIDER_DEFINITIVE};</li>
 *   <li>{@link AiResponseException} &rarr; {@code RESPONSE_INVALID};</li>
 *   <li>{@link BusinessRuleException} &rarr; {@code VALIDATION};</li>
 *   <li>anything else &rarr; {@code UNKNOWN}.</li>
 * </ul>
 */
public final class AiFailureCategory {

    private AiFailureCategory() {
    }

    /**
     * Classifies a throwable into a stable failure category token.
     *
     * @param t the throwable to classify (may be {@code null})
     * @return the stable failure category; {@code UNKNOWN} for a {@code null} or unrecognized type
     */
    public static String of(Throwable t) {
        if (t instanceof AiTimeoutException) {
            return "TIMEOUT";
        }
        if (t instanceof AiRateLimitedException) {
            return "RATE_LIMITED";
        }
        if (t instanceof AiProviderUnavailableException) {
            return "PROVIDER_UNAVAILABLE";
        }
        if (t instanceof AiTransientProviderException) {
            return "PROVIDER_5XX";
        }
        if (t instanceof AiDefinitiveProviderException) {
            return "PROVIDER_DEFINITIVE";
        }
        if (t instanceof AiResponseException) {
            return "RESPONSE_INVALID";
        }
        if (t instanceof BusinessRuleException) {
            return "VALIDATION";
        }
        return "UNKNOWN";
    }
}
