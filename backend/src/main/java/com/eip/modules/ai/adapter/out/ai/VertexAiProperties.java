package com.eip.modules.ai.adapter.out.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Environment-driven configuration for the Vertex AI gateway.
 *
 * <p>All values here are <strong>environment configuration</strong>, never
 * hardcoded secrets. {@code project}, {@code location}, {@code endpoint} and
 * {@code apiVersion} are resolved from environment variables / YAML
 * ({@code application-cloud.yml}); the model id is resolved separately from the
 * router ({@code ai_model_config}), not from this record. Credentials are
 * resolved via ADC (Application Default Credentials — {@code GOOGLE_APPLICATION_CREDENTIALS}
 * / Workload Identity) and are <strong>never</strong> stored here or in YAML.
 *
 * <p>Bound under the prefix {@code eip.ai.vertex}. Activation is scoped to the
 * {@code cloud} profile via {@link VertexAiConfig}, so the default / mock demo
 * profile is unaffected.
 *
 * @param project    the Google Cloud project id (e.g. {@code eip-ai-dev})
 * @param location   the Vertex AI location (e.g. {@code global})
 * @param endpoint   the Vertex AI REST endpoint base URL
 * @param apiVersion the Vertex AI REST API version (e.g. {@code v1})
 */
@Validated
@ConfigurationProperties(prefix = "eip.ai.vertex")
public record VertexAiProperties(
        String project,
        String location,
        String endpoint,
        String apiVersion) {
}
