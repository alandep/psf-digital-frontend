package com.eip.platform.security;

import java.nio.charset.StandardCharsets;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

/**
 * <strong>DEV-ONLY</strong> fallback {@link JwtDecoder}.
 *
 * <p>When no {@code JwtDecoder} bean is present — i.e. no
 * {@code spring.security.oauth2.resourceserver.jwt.issuer-uri} is configured —
 * this provides a symmetric HS256 decoder so the resource server (and thus the
 * application) can start in local/dev environments.
 *
 * <p>In production, set {@code issuer-uri} (or {@code jwk-set-uri}); Spring Boot
 * will then auto-configure a proper asymmetric decoder and this bean will be
 * skipped by {@link ConditionalOnMissingBean}. The symmetric secret here must
 * never be used to protect real tokens.
 */
@Configuration
public class JwtDecoderFallbackConfig {

    @Bean
    @ConditionalOnMissingBean(JwtDecoder.class)
    public JwtDecoder devJwtDecoder(
            @Value("${eip.security.jwt.secret:change-me-dev-secret-change-me-32bytes}") String secret) {
        SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key).build();
    }
}
