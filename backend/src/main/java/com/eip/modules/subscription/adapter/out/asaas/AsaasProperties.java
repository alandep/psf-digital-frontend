package com.eip.modules.subscription.adapter.out.asaas;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Asaas gateway configuration ({@code eip.asaas.*}). {@code apiKey} and
 * {@code webhookToken} are secrets: never log them.
 *
 * @param enabled      true = real Asaas adapter; false = in-memory fake
 * @param baseUrl      API base URL (sandbox or production, ending in /v3)
 * @param apiKey       Asaas API key (header {@code access_token})
 * @param webhookToken token Asaas sends in the {@code asaas-access-token} header
 */
@ConfigurationProperties(prefix = "eip.asaas")
public record AsaasProperties(boolean enabled, String baseUrl, String apiKey, String webhookToken) {

    public static final String DEFAULT_BASE_URL = "https://api-sandbox.asaas.com/v3";

    public AsaasProperties {
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = DEFAULT_BASE_URL;
        }
    }

    @Override
    public String toString() {
        return "AsaasProperties[enabled=" + enabled + ", baseUrl=" + baseUrl + "]";
    }
}
