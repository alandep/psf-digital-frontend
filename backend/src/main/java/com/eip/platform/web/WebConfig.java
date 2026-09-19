package com.eip.platform.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration for browser clients.
 *
 * <p>Registers CORS for the Angular SPA. Allowed origins are configurable via
 * {@code eip.cors.allowed-origins} (comma-separated), defaulting to the local
 * dev server at {@code http://localhost:4200}. Credentials are allowed so the
 * session/CSRF cookies flow, and {@code X-Correlation-Id} is exposed for
 * client-side request tracing.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;

    public WebConfig(
            @Value("${eip.cors.allowed-origins:http://localhost:4200}") String allowedOrigins) {
        this.allowedOrigins = splitOrigins(allowedOrigins);
    }

    private static String[] splitOrigins(String raw) {
        if (raw == null || raw.isBlank()) {
            return new String[0];
        }
        String[] parts = raw.split(",");
        for (int i = 0; i < parts.length; i++) {
            parts[i] = parts[i].trim();
        }
        return parts;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("X-Correlation-Id")
                .allowCredentials(true);
    }
}
