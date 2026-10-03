package com.eip.modules.ai.adapter.out.ai;

import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;

import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;

/**
 * Dedicated Spring-managed component that performs the single HTTP POST to the
 * Vertex AI Gemini {@code generateContent} endpoint and carries the Resilience4j
 * annotations, active only in the {@code cloud} profile.
 *
 * <p><strong>Why a separate bean (AOP proxy correctness):</strong> Resilience4j
 * annotations ({@code @CircuitBreaker}/{@code @Retry}/{@code @Bulkhead}) are
 * applied by Spring AOP, which only intercepts calls that pass through the bean
 * proxy. If the resilient method lived on {@code VertexAiGatewayAdapter} and were
 * invoked by that same bean's {@code run(...)} via {@code this}, the call would be
 * a <em>self-invocation</em> and would <strong>bypass the proxy entirely</strong>,
 * silently disabling resilience. Extracting the annotated call into this separate
 * {@code @Component} and injecting it into the adapter guarantees every call goes
 * through the proxy, so the annotations actually take effect.
 *
 * <p><strong>Timeout choice ({@code @TimeLimiter} omitted on purpose):</strong>
 * Resilience4j's {@code @TimeLimiter} requires the annotated method to return a
 * {@code CompletableFuture} (it runs the call on another thread to enforce the
 * deadline). To keep this a simple, synchronous call, the timeout is instead
 * enforced at the HTTP client level: the {@link RestClient} is built with a
 * request factory configured with connect/read timeouts. This satisfies the
 * "apply a time limit" requirement (R9.1) without forcing an async signature.
 *
 * <p><strong>Scope:</strong> transport only. No business concern, no prompt
 * building, no telemetry mapping. The bearer token is never logged.
 */
@Component
@Profile("cloud")
public class VertexAiCaller {

    private final RestClient restClient;

    /**
     * Builds the {@link RestClient} with a request factory that enforces
     * connect/read timeouts (the HTTP-client-level timeout that replaces
     * {@code @TimeLimiter} — see class Javadoc).
     *
     * <p>The connect/read timeouts are config-driven from
     * {@code eip.ai.vertex.timeout.*} (env vars {@code VERTEX_CONNECT_TIMEOUT} /
     * {@code VERTEX_READ_TIMEOUT}), defaulting to 30s. Spring parses the duration
     * suffix (e.g. {@code "30s"}) into {@link Duration}, so nothing is hardcoded.
     *
     * @param restClientBuilder builder used to construct the REST client
     * @param connectTimeout    HTTP connect timeout (default 30s)
     * @param readTimeout       HTTP read timeout (default 30s)
     */
    public VertexAiCaller(
            RestClient.Builder restClientBuilder,
            @Value("${eip.ai.vertex.timeout.connect:30s}") Duration connectTimeout,
            @Value("${eip.ai.vertex.timeout.read:30s}") Duration readTimeout) {
        // Timeout enforced at the HTTP client level (connect + read). @TimeLimiter
        // is intentionally omitted to keep call(...) a synchronous JsonNode method
        // rather than forcing a CompletableFuture return type. A plain
        // SimpleClientHttpRequestFactory is used so this stays independent of the
        // Spring Boot client-factory helper APIs that moved between 3.x versions.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);
        this.restClient = restClientBuilder
                .requestFactory(factory)
                .build();
    }

    /**
     * Performs the single POST to Gemini {@code generateContent}, guarded by
     * Resilience4j. The circuit breaker, retry and bulkhead all share the
     * {@code "vertex"} instance configured in {@code application-cloud.yml}.
     *
     * <ul>
     *   <li>{@code @CircuitBreaker} — when the circuit is OPEN the call fails fast
     *       without touching the provider (R9.4, R9.5).</li>
     *   <li>{@code @Retry} — at most 1 retry, and only on allow-listed transient
     *       exceptions; non-transient (e.g. 4xx) propagate without retry
     *       (R9.2, R9.3).</li>
     *   <li>{@code @Bulkhead} — bounds the number of concurrent provider calls
     *       (R9.4).</li>
     * </ul>
     *
     * @param url         the fully built {@code :generateContent} URL
     * @param bearerToken the ADC-derived bearer token (never logged)
     * @param body        the JSON request body as a map
     * @return the parsed JSON response
     */
    @CircuitBreaker(name = "vertex")
    @Retry(name = "vertex")
    @Bulkhead(name = "vertex")
    public JsonNode call(String url, String bearerToken, Map<String, Object> body) {
        return restClient.post()
                .uri(url)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + bearerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
    }
}
