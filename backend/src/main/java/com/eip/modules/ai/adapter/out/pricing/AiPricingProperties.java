package com.eip.modules.ai.adapter.out.pricing;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Versioned AI price table (FinOps), bound under the prefix {@code eip.ai.pricing}.
 *
 * <p>The price source is <strong>versioned configuration</strong> (not a DB
 * table): it works in every profile (including the mock/demo), needs no
 * migration, and a price change is a configuration change that requires no code
 * deploy (Requirements 11.3, 11.4). The {@link #version} field makes the active
 * price sheet explicit and auditable.
 *
 * <p>Rates are keyed by {@code "provider:model"} (e.g.
 * {@code "vertex-ai:gemini-3.8-flash"}). Each {@link Rate} expresses the price
 * per one million tokens for prompt (input), output and thinking tokens.
 *
 * @param version the version tag of the active price sheet (e.g. {@code 2026-01})
 * @param rates   the per-{@code provider:model} rate table (may be empty/null)
 */
@ConfigurationProperties(prefix = "eip.ai.pricing")
public record AiPricingProperties(String version, Map<String, Rate> rates) {

    /**
     * Price rate for a single {@code provider:model}, expressed per one million
     * tokens. Any component may be {@code null} when not applicable; callers
     * treat a {@code null} component as zero.
     *
     * @param inputPerMillion    price per 1,000,000 prompt (input) tokens
     * @param outputPerMillion   price per 1,000,000 output tokens
     * @param thinkingPerMillion price per 1,000,000 thinking tokens
     */
    public record Rate(BigDecimal inputPerMillion, BigDecimal outputPerMillion, BigDecimal thinkingPerMillion) {
    }
}
