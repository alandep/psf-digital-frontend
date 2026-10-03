package com.eip.modules.ai.adapter.out.pricing;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Registers {@link AiPricingProperties} as a bound configuration-properties bean.
 *
 * <p>The project does not use {@code @ConfigurationPropertiesScan}, so each
 * {@code @ConfigurationProperties} holder is registered explicitly (mirroring
 * {@code VertexAiConfig}). This configuration is <strong>profile-agnostic</strong>
 * on purpose: pricing applies to any profile (mock/demo included), so cost can
 * be computed everywhere without a GCP dependency.
 */
@Configuration
@EnableConfigurationProperties(AiPricingProperties.class)
public class AiPricingConfig {
}
