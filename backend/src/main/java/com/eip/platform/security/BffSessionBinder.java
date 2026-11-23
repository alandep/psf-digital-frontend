package com.eip.platform.security;

import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Binds a freshly created user + organization to the HTTP session and persists
 * a Spring {@link SecurityContext}, so the SPA is authenticated right after a
 * public signup/checkout. Session attribute names must match
 * {@code AuthBffController} / {@code SessionOrganizationContextFilter}.
 */
@Component
public class BffSessionBinder {

    public static final String SESSION_ORG = "EIP_ORG";
    public static final String SESSION_USER = "EIP_USER";

    private final HttpSessionSecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public void bind(HttpServletRequest request, HttpServletResponse response,
            String organizationId, String userId) {
        HttpSession existing = request.getSession(false);
        if (existing != null) {
            // Fresh identity: never reuse a pre-existing session id (fixation).
            request.changeSessionId();
        }
        HttpSession session = request.getSession(true);
        session.setAttribute(SESSION_ORG, organizationId);
        session.setAttribute(SESSION_USER, userId);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userId, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }
}
