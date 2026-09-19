package com.eip.modules.export.adapter.in;

import java.io.IOException;
import java.util.UUID;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;
import com.eip.platform.tenant.OrganizationId;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * DEV ONLY: real org context comes from the authenticated session/JWT (Identity module).
 *
 * <p>Binds a seeded organization to the current thread for {@code /bff/} and
 * {@code /api/v1/} requests when no context is already present, so the export
 * vertical slice runs end-to-end before the Identity module is wired. This will
 * be replaced by the Identity batch.
 *
 * <p>Superseded by the Identity module's session-based context filter. Disabled
 * by default; enable only for local dev without the auth flow by setting
 * {@code eip.dev.fake-org=true}.
 */
@Component
@Order(3)
@ConditionalOnProperty(name = "eip.dev.fake-org", havingValue = "true", matchIfMissing = false)
public class DevOrganizationContextFilter extends OncePerRequestFilter {

    // DEV ONLY: seeded organization UUID from the baseline data.
    private static final UUID DEV_ORG = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        boolean scoped = path != null && (path.startsWith("/bff/") || path.startsWith("/api/v1/"));
        boolean bound = false;
        if (scoped && OrganizationContextHolder.currentOrNull() == null) {
            // DEV ONLY: real org context comes from the authenticated session/JWT.
            OrganizationContextHolder.set(
                    OrganizationContext.anonymous(OrganizationId.of(DEV_ORG)));
            bound = true;
        }
        try {
            filterChain.doFilter(request, response);
        } finally {
            if (bound) {
                OrganizationContextHolder.clear();
            }
        }
    }
}
