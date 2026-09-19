package com.eip.platform.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

/**
 * HTTP security configuration split into two independent filter chains:
 *
 * <ul>
 *   <li><b>apiChain</b> ({@code /api/v1/**}) — stateless, JWT bearer resource
 *       server, CSRF disabled. Consumed by machine/SPA clients.</li>
 *   <li><b>bffChain</b> ({@code /bff/**}, {@code /login/**}, {@code /actuator/**})
 *       — session-based BFF with form login and cookie CSRF for browser clients.</li>
 * </ul>
 *
 * Method-level security ({@code @PreAuthorize}) is enabled for the whole app.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    @Order(1)
    public SecurityFilterChain apiChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/v1/**")
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain bffChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/bff/**", "/login/**", "/actuator/**", "/webhooks/**")
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/bff/auth/**",
                                "/bff/public/**",
                                "/actuator/health/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/login/**",
                                // Inbound billing webhooks (e.g. Stripe): no session/auth;
                                // authenticity is verified by signature + inbox idempotency.
                                "/webhooks/**").permitAll()
                        .anyRequest().authenticated())
                .formLogin(Customizer.withDefaults())
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        // The SPA's first login calls are a pre-auth JSON API and
                        // cannot carry a CSRF token yet; exempt them. All other
                        // /bff/** endpoints keep cookie-based CSRF protection.
                        // Webhooks are server-to-server and cannot carry a CSRF token.
                        .ignoringRequestMatchers("/bff/auth/**", "/webhooks/**"));
        return http.build();
    }

    /**
     * Delegating password encoder supporting multiple hashing schemes with a
     * {@code {id}} prefix; new hashes use the current default (bcrypt).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}
