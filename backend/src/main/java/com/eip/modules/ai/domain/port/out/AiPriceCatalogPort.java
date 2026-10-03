package com.eip.modules.ai.domain.port.out;

import java.math.BigDecimal;

import com.eip.modules.ai.domain.model.AiResult;

/**
 * Outbound port that computes the {@code provider_cost} of an AI usage from a
 * <strong>versioned price source</strong> (FinOps).
 *
 * <p>Design decisions:
 * <ul>
 *   <li>Cost computation lives <strong>outside</strong> the Vertex adapter: the
 *       gateway adapter only performs transport + telemetry, never pricing
 *       (Requirement 11.2).</li>
 *   <li>The price is read from a versioned source (versioned configuration
 *       properties), so a price change is a configuration change that
 *       <strong>requires no code deploy</strong> (Requirements 11.2, 11.4).</li>
 * </ul>
 *
 * <p>The computed cost feeds the usage ledger ({@code ai_usage_event.provider_cost},
 * {@code numeric(18,6)}).
 */
public interface AiPriceCatalogPort {

    /**
     * Computes the provider cost for a completed AI usage, using a versioned
     * price source keyed by {@code provider} + {@code model}.
     *
     * @param provider the provider that served the request (e.g. {@code vertex-ai})
     * @param model    the model that served the request (e.g. {@code gemini-3.8-flash})
     * @param result   the AI result carrying the real token telemetry
     * @return the provider cost scaled to 6 decimals; {@link BigDecimal#ZERO}
     *         when no price is configured (fail-open on cost)
     */
    BigDecimal providerCost(String provider, String model, AiResult result);
}
