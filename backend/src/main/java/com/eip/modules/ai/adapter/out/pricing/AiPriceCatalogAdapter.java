package com.eip.modules.ai.adapter.out.pricing;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.port.out.AiPriceCatalogPort;

/**
 * Computes {@code provider_cost} from the versioned price configuration
 * ({@link AiPricingProperties}), outside the Vertex adapter (Requirement 11.2).
 *
 * <p>Lookup is by key {@code provider + ":" + model}. When no rate is configured
 * the adapter is <strong>fail-open on cost</strong>: it returns
 * {@link BigDecimal#ZERO} and never throws, so a missing price cannot break the
 * AI call. A price change is a configuration change (no deploy), per Requirements
 * 11.3 and 11.4.
 *
 * <p>Cost is computed with {@link BigDecimal} math as:
 * <pre>
 * cost = inputPerMillion    * promptTokens   / 1_000_000
 *      + outputPerMillion   * outputTokens   / 1_000_000
 *      + thinkingPerMillion * thinkingTokens / 1_000_000
 * </pre>
 * and scaled to 6 decimals (matching {@code ai_usage_event.provider_cost
 * numeric(18,6)}) with {@link RoundingMode#HALF_UP}.
 */
@Component
public class AiPriceCatalogAdapter implements AiPriceCatalogPort {

    private static final Logger log = LoggerFactory.getLogger(AiPriceCatalogAdapter.class);

    private static final int COST_SCALE = 6;
    private static final BigDecimal ONE_MILLION = BigDecimal.valueOf(1_000_000L);

    private final AiPricingProperties pricing;

    public AiPriceCatalogAdapter(AiPricingProperties pricing) {
        this.pricing = pricing;
    }

    @Override
    public BigDecimal providerCost(String provider, String model, AiResult result) {
        String key = provider + ":" + model;
        AiPricingProperties.Rate rate = pricing.rates() == null ? null : pricing.rates().get(key);

        if (rate == null) {
            // Fail-open: a missing price must not break the AI call. No secrets logged.
            log.debug("No AI price configured for key '{}' (pricing version '{}'); returning zero cost.",
                    key, pricing.version());
            return BigDecimal.ZERO.setScale(COST_SCALE, RoundingMode.HALF_UP);
        }

        BigDecimal inputCost = component(rate.inputPerMillion(), result.promptTokens());
        BigDecimal outputCost = component(rate.outputPerMillion(), result.outputTokens());
        BigDecimal thinkingCost = component(rate.thinkingPerMillion(), result.thinkingTokens());

        return inputCost.add(outputCost).add(thinkingCost)
                .setScale(COST_SCALE, RoundingMode.HALF_UP);
    }

    /**
     * Computes {@code perMillion * tokens / 1_000_000}. A {@code null} rate
     * component is treated as zero.
     */
    private static BigDecimal component(BigDecimal perMillion, long tokens) {
        if (perMillion == null || tokens <= 0) {
            return BigDecimal.ZERO;
        }
        return perMillion.multiply(BigDecimal.valueOf(tokens))
                .divide(ONE_MILLION, COST_SCALE, RoundingMode.HALF_UP);
    }
}
