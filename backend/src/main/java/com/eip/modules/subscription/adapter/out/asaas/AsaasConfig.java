package com.eip.modules.subscription.adapter.out.asaas;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Registers {@link AsaasProperties} and, in the cloud profile, aborts startup
 * when the real gateway is enabled without its secrets.
 */
@Configuration
@EnableConfigurationProperties(AsaasProperties.class)
public class AsaasConfig {

    @Bean
    @Profile("cloud")
    InitializingBean asaasSecretsCheck(AsaasProperties props) {
        return () -> {
            if (!props.enabled()) {
                return;
            }
            if (isBlank(props.apiKey())) {
                throw new IllegalStateException(
                        "eip.asaas.enabled=true exige EIP_ASAAS_API_KEY (secret eip-asaas-api-key).");
            }
            if (isBlank(props.webhookToken())) {
                throw new IllegalStateException(
                        "eip.asaas.enabled=true exige EIP_ASAAS_WEBHOOK_TOKEN (secret eip-asaas-webhook-token).");
            }
        };
    }

    private static boolean isBlank(String v) {
        return v == null || v.isBlank();
    }
}
