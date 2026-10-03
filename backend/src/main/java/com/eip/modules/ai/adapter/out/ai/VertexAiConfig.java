package com.eip.modules.ai.adapter.out.ai;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Enables {@link VertexAiProperties} binding only in the {@code cloud} profile.
 *
 * <p>Scoping activation to {@code @Profile("cloud")} keeps the default /
 * {@code local} mock demo profile untouched (demo safety): outside {@code cloud}
 * this configuration — and therefore the {@code eip.ai.vertex} binding — does not
 * activate. The real {@code VertexAiGatewayAdapter} (also {@code @Profile("cloud")})
 * will consume these properties.
 */
@Configuration
@Profile("cloud")
@EnableConfigurationProperties(VertexAiProperties.class)
public class VertexAiConfig {
}
