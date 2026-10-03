package com.eip.platform.web;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * CORS configuration for the browser clients (Angular SPA on a DIFFERENT origin
 * than the API in production: https://iaexport.com.br -> https://api.iaexport.com.br).
 *
 * <p>Exposes a single {@link CorsConfigurationSource} bean. Spring Security's
 * {@code http.cors(withDefaults())} on both the apiChain and the bffChain resolves
 * this bean directly, so the exact same CORS policy applies to the Security filter
 * chains (including CORS preflight {@code OPTIONS} on {@code /bff/**}). Relying on a
 * dedicated bean — rather than only a {@code WebMvcConfigurer#addCorsMappings} bridge —
 * removes any ambiguity about whether MVC CORS reaches the Security layer.
 *
 * <p>Allowed origins are configurable via {@code eip.cors.allowed-origins}
 * (comma-separated), defaulting to the local dev server {@code http://localhost:4200}.
 * The cloud profile overrides it with the production origin. We NEVER use {@code "*"}:
 * credentials ({@code allowCredentials(true)}) are incompatible with a wildcard origin.
 *
 * <p>Exposed response headers include {@code X-Correlation-Id} (error envelope tracing),
 * {@code X-Trace-Id} (AI observability) and {@code Retry-After} (429 rate-limit backoff),
 * all of which the Angular interceptors read.
 */
@Configuration
public class WebConfig {

    private final List<String> allowedOrigins;

    public WebConfig(
            @Value("${eip.cors.allowed-origins:http://localhost:4200}") String allowedOrigins) {
        this.allowedOrigins = splitOrigins(allowedOrigins);
    }

    private static List<String> splitOrigins(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Credentialed cross-site requests: list the request headers the SPA sends
        // explicitly rather than "*", since some browsers reject the wildcard when
        // Access-Control-Allow-Credentials is true.
        config.setAllowedHeaders(List.of(
                "Content-Type",
                "X-XSRF-TOKEN",
                "X-Trace-Id",
                "Authorization"));
        // Response headers the Angular interceptors need to read cross-origin.
        config.setExposedHeaders(List.of("X-Correlation-Id", "X-Trace-Id", "Retry-After"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
