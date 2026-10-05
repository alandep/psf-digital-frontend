package com.eip.platform.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.filter.OncePerRequestFilter;

import com.eip.modules.identity.adapter.in.SessionOrganizationContextFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/**
 * HTTP security configuration split into two independent filter chains:
 *
 * <ul>
 *   <li><b>apiChain</b> ({@code /api/v1/**}) — stateless, JWT bearer resource
 *       server, CSRF disabled. Consumed by machine/SPA clients.</li>
 *   <li><b>bffChain</b> ({@code /bff/**}, {@code /login/**}, {@code /actuator/**})
 *       — session-based BFF with cookie CSRF for browser clients. Unauthenticated
 *       requests get HTTP 401 (not a redirect) so the SPA can handle it.</li>
 * </ul>
 *
 * Method-level security ({@code @PreAuthorize}) is enabled for the whole app.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    /**
     * When true (cloud profile / DEGUSTAÇÃO), the CSRF cookie is hardened with
     * {@code Secure} and {@code SameSite=None} for the cross-site HTTPS flow from
     * {@code https://iaexport.com.br} (Firebase Hosting) to the Cloud Run NATIVE URL
     * {@code https://eip-backend-...-rj.a.run.app}.
     *
     * <p>Those two hosts have <b>different registrable domains</b>
     * ({@code iaexport.com.br} vs {@code run.app}), so the flow is <b>cross-site</b> —
     * not merely cross-origin. A cross-site authenticated fetch/XHR only carries the
     * cookie when it is marked {@code SameSite=None; Secure}; {@code SameSite=Lax} would
     * NOT be sent cross-site and would silently break CSRF/login. Hence {@code None} is
     * mandatory here. CORS stays mandatory and restricted to {@code https://iaexport.com.br}.
     * {@code Secure} is required because Cloud Run is HTTPS-only. The CSRF cookie's
     * {@code httpOnly} stays false (readable by Angular's XSRF mechanism) and CSRF
     * protection itself is never disabled. Defaults to false so the local flow (plain
     * HTTP, same-origin) is not broken.
     *
     * <p>FUTURO: quando o backend migrar para {@code api.iaexport.com.br} (mesmo registrable
     * domain {@code iaexport.com.br} → same-site), o correto é voltar a {@code SameSite=Lax}
     * (mais restritivo).
     */
    private final boolean crossSiteCookie;

    public SecurityConfig(
            @Value("${eip.security.cookie.cross-site:false}") boolean crossSiteCookie) {
        this.crossSiteCookie = crossSiteCookie;
    }

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
    public SecurityFilterChain bffChain(HttpSecurity http,
            SessionOrganizationContextFilter sessionOrganizationContextFilter) throws Exception {
        // Opt OUT of Spring Security 6's deferred CSRF token loading: by setting the
        // request-attribute name to null the token is resolved eagerly instead of only
        // when something reads it. Combined with the CsrfCookieFilter below this ensures
        // the XSRF-TOKEN cookie is actually written to responses.
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null);

        // Cookie CSRF repository. The cookie MUST remain readable by JS (httpOnly=false)
        // so the SPA can mirror XSRF-TOKEN into the X-XSRF-TOKEN header. In the cloud
        // profile (DEGUSTAÇÃO) we additionally harden it with Secure + SameSite=None: the
        // flow iaexport.com.br (Firebase) -> run.app (Cloud Run) is CROSS-SITE (different
        // registrable domains), so None is MANDATORY for the cookie to travel on the
        // authenticated XHR/fetch (Lax would not be sent cross-site), while Secure is
        // required on HTTPS. By default (local) those attributes stay off to avoid
        // breaking plain http://localhost. CSRF protection itself is never disabled.
        // FUTURO: ao migrar para api.iaexport.com.br (same-site), voltar a SameSite=Lax.
        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        if (crossSiteCookie) {
            csrfTokenRepository.setCookieCustomizer(cookie -> cookie.secure(true).sameSite("None"));
        }

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
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfTokenRepository)
                        .csrfTokenRequestHandler(requestHandler)
                        // The SPA's first login calls are a pre-auth JSON API and
                        // cannot carry a CSRF token yet; exempt them. All other
                        // /bff/** endpoints keep cookie-based CSRF protection.
                        // Webhooks are server-to-server and cannot carry a CSRF token.
                        .ignoringRequestMatchers("/bff/auth/**", "/webhooks/**"))
                .addFilterBefore(sessionOrganizationContextFilter, AuthorizationFilter.class)
                // Materialize the CSRF token on every request so the cookie is emitted
                // (see CsrfCookieFilter below for the full rationale).
                .addFilterAfter(new CsrfCookieFilter(), CsrfFilter.class);
        return http.build();
    }

    /**
     * Forces the deferred {@link CsrfToken} to be materialized on every request so that
     * {@link CookieCsrfTokenRepository} actually writes the {@code XSRF-TOKEN} cookie to
     * the response.
     *
     * <p>Spring Security 6 loads the CSRF token lazily: the cookie is only written once
     * something reads the token value. Nothing in the plain BFF flow reads it, so the SPA
     * never receives {@code XSRF-TOKEN} and every authenticated {@code POST /bff/**}
     * subsequently fails CSRF validation with HTTP 403. Reading the token here (via
     * {@code getToken()}) triggers the deferred load and causes the cookie to be emitted.
     */
    private static final class CsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                FilterChain filterChain) throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                csrfToken.getToken(); // touch -> triggers deferred load -> cookie is written
            }
            filterChain.doFilter(request, response);
        }
    }

    /**
     * The SessionOrganizationContextFilter is wired INTO the bffChain (before
     * AuthorizationFilter) so it populates the SecurityContext before
     * authorization is evaluated. Disable its automatic global servlet-filter
     * registration so it does not also run (in the wrong order) outside the
     * security chain.
     */
    @Bean
    public FilterRegistrationBean<SessionOrganizationContextFilter> sessionOrgFilterRegistration(
            SessionOrganizationContextFilter filter) {
        FilterRegistrationBean<SessionOrganizationContextFilter> registration =
                new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
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
