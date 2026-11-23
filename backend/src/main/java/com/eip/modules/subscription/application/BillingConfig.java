package com.eip.modules.subscription.application;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Registers {@link BillingProperties} (the project does not use
 * {@code @ConfigurationPropertiesScan}).
 */
@Configuration
@EnableConfigurationProperties(BillingProperties.class)
public class BillingConfig {
}
