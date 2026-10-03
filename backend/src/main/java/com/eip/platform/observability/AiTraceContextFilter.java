package com.eip.platform.observability;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Propagates the UI-originated trace id across the backend for end-to-end
 * observability.
 *
 * <p>Reads the {@code X-Trace-Id} request header sent by the frontend (or
 * generates a UUID when absent/blank), exposes it in the SLF4J {@link MDC}
 * under {@code traceId} so it appears in all log lines alongside the existing
 * {@code correlationId}, and echoes it back on the response header. The MDC
 * entry is always cleared in {@code finally} to avoid leaking across pooled
 * request threads.
 *
 * <p>Runs with {@link Order @Order(2)}, immediately after
 * {@link CorrelationIdFilter} ({@code @Order(1)}), so both tracing identifiers
 * are present in the MDC for the duration of the request.
 */
@Component
@Order(2)
public class AiTraceContextFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Trace-Id";
    public static final String MDC_KEY = "traceId";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String traceId = request.getHeader(HEADER);
        if (!StringUtils.hasText(traceId)) {
            traceId = UUID.randomUUID().toString();
        }
        MDC.put(MDC_KEY, traceId);
        response.setHeader(HEADER, traceId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }
}
