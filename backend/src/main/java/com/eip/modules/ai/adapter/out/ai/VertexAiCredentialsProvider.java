package com.eip.modules.ai.adapter.out.ai;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.google.auth.oauth2.GoogleCredentials;

import lombok.extern.slf4j.Slf4j;

/**
 * Supplies Application Default Credentials (ADC) bearer tokens for the Vertex AI
 * gateway, active only in the {@code cloud} profile.
 *
 * <p><strong>Fail-fast (R14.5):</strong> this bean implements
 * {@link InitializingBean} and resolves ADC once during startup
 * ({@link #afterPropertiesSet()}). If credentials cannot be obtained, it throws a
 * clear {@link IllegalStateException} with an actionable message, which makes the
 * {@code cloud}-profile application context <em>fail to start</em> instead of
 * booting and only failing on the first AI call.
 *
 * <p><strong>Demo safety:</strong> because the bean is {@code @Profile("cloud")},
 * the fail-fast check never runs in the default / demo (mock) profile — the
 * deterministic {@code MockAiGatewayAdapter} path is completely unaffected.
 *
 * <p><strong>Security (R14.3, R14.4):</strong> no {@code key.json} is read
 * (ADC only — {@code gcloud auth application-default login} locally, Workload
 * Identity / attached service account on Cloud Run) and the token value is
 * <strong>never</strong> logged. Only a non-secret confirmation is logged at INFO.
 */
@Slf4j
@Component
@Profile("cloud")
public class VertexAiCredentialsProvider implements InitializingBean {

    private static final String CLOUD_PLATFORM_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

    /**
     * The ADC-resolved, Cloud Platform-scoped credentials, cached after the first
     * successful resolution so each {@link #bearerToken()} call only refreshes the
     * access token rather than re-resolving ADC.
     */
    private GoogleCredentials credentials;

    /**
     * Fail-fast on startup: resolve ADC once so a missing-credentials environment
     * surfaces as a context-startup failure (R14.5) rather than a runtime error on
     * the first provider call. The token value is never logged.
     *
     * @throws IllegalStateException when ADC cannot be obtained; the message is
     *                               actionable and mentions ADC setup options
     */
    @Override
    public void afterPropertiesSet() {
        this.credentials = resolveCredentials();
        log.info("ADC resolved for Vertex AI");
    }

    /**
     * Returns a fresh ADC access token, refreshing the cached credentials if the
     * current token is missing or expired. Reads no {@code key.json} and never
     * logs the token value.
     *
     * @return the bearer token value
     * @throws IllegalStateException when the token cannot be refreshed
     */
    public String bearerToken() {
        try {
            credentials.refreshIfExpired();
            return credentials.getAccessToken().getTokenValue();
        } catch (IOException e) {
            throw adcFailure(e);
        }
    }

    /**
     * Resolves Application Default Credentials scoped to the Cloud Platform scope.
     *
     * @return the scoped credentials
     * @throws IllegalStateException when ADC cannot be obtained
     */
    private GoogleCredentials resolveCredentials() {
        try {
            return GoogleCredentials.getApplicationDefault()
                    .createScoped(List.of(CLOUD_PLATFORM_SCOPE));
        } catch (IOException e) {
            throw adcFailure(e);
        }
    }

    /**
     * Builds the shared, actionable fail-fast exception for missing/unavailable
     * ADC. The message never contains any secret or token value.
     *
     * @param cause the underlying I/O failure
     * @return the {@link IllegalStateException} to throw
     */
    private IllegalStateException adcFailure(IOException cause) {
        return new IllegalStateException(
                "Unable to obtain Application Default Credentials (ADC) for Vertex AI. "
                        + "Ensure ADC is configured (e.g. 'gcloud auth application-default login' locally "
                        + "or Workload Identity / an attached service account on Cloud Run). "
                        + "No key.json is used.", cause);
    }
}
