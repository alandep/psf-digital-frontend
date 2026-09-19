package com.eip.modules.identity.adapter.in;

import java.io.IOException;
import java.util.UUID;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.eip.modules.identity.adapter.in.bff.AuthBffController;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;
import com.eip.platform.tenant.OrganizationId;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Binds the {@link OrganizationContext} from the authenticated HTTP session for
 * each request, reading the {@code EIP_ORG} / {@code EIP_USER} attributes set by
 * {@link AuthBffController} once the auth flow completes. Replaces the export
 * module's DEV filter as the source of tenant context for authenticated calls.
 */
@Component
@Order(2)
public class SessionOrganizationContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        boolean bound = false;
        HttpSession session = request.getSession(false);
        if (session != null && OrganizationContextHolder.currentOrNull() == null) {
            Object org = session.getAttribute(AuthBffController.SESSION_ORG);
            Object user = session.getAttribute(AuthBffController.SESSION_USER);
            if (org != null && user != null) {
                OrganizationContextHolder.set(new OrganizationContext(
                        OrganizationId.of(org.toString()),
                        UUID.fromString(user.toString()),
                        true));
                bound = true;
            }
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
