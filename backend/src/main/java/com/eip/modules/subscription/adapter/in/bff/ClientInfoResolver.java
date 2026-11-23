package com.eip.modules.subscription.adapter.in.bff;

import com.eip.modules.subscription.application.BillingCommands.ClientInfo;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Extracts the caller IP (first {@code X-Forwarded-For} value, else the remote
 * address — Cloud Run / load balancers prepend the client IP) and user agent.
 */
final class ClientInfoResolver {

    private ClientInfoResolver() {
    }

    static ClientInfo of(HttpServletRequest request) {
        return new ClientInfo(ip(request), request.getHeader("User-Agent"));
    }

    static String ip(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String first = forwarded.split(",")[0].trim();
            if (!first.isEmpty()) {
                return first;
            }
        }
        return request.getRemoteAddr();
    }
}
