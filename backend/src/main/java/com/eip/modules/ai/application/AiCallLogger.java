package com.eip.modules.ai.application;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.model.AiTask;

/**
 * Emits exactly one structured log line per AI call outcome (Req 9.3).
 *
 * <p>Reads {@code correlationId} and {@code traceId} from the MDC (populated upstream by the
 * correlation/trace filters) rather than requiring them as parameters, so every log line is
 * correlated end-to-end without threading identifiers through the call stack.
 *
 * <p><strong>Redaction contract (Req 9.6, 11.4):</strong> this logger NEVER emits the bearer
 * token, NEVER emits the full document text and NEVER emits {@link AiResult#output()}. Only
 * aggregate telemetry (operation, provider, model, tokens, finishReason, latency) and, on
 * failure, the exception class plus its own short pt-BR message are logged. The throwable's
 * stack trace is intentionally NOT passed to the logger on failure, because frames may carry
 * request/document payloads; only the message string is logged.
 */
@Component
public class AiCallLogger {

    private static final Logger log = LoggerFactory.getLogger(AiCallLogger.class);

    /**
     * Logs a successful AI call at INFO level with aggregate telemetry only.
     *
     * <p>Redaction: {@link AiResult#output()} is never read or logged.
     *
     * @param task   the AI operation performed
     * @param result the aggregate telemetry of the successful call
     */
    public void logSuccess(AiTask task, AiResult result) {
        log.info("ai_call outcome=SUCCESS op={} provider={} model={} promptTokens={} outputTokens={} "
                + "thinkingTokens={} totalTokens={} finishReason={} latencyMs={} correlationId={} traceId={}",
                task != null ? task.name() : null,
                result != null ? result.provider() : null,
                result != null ? result.model() : null,
                result != null ? result.promptTokens() : null,
                result != null ? result.outputTokens() : null,
                result != null ? result.thinkingTokens() : null,
                result != null ? result.totalTokens() : null,
                result != null ? result.finishReason() : null,
                result != null ? result.latencyMs() : null,
                MDC.get("correlationId"),
                MDC.get("traceId"));
    }

    /**
     * Logs a failed AI call at WARN level with the failure category and a redacted message.
     *
     * <p>Redaction: only {@code t.getClass().getSimpleName()} and {@code t.getMessage()} (a short
     * pt-BR phrase, safe by construction) are logged. The throwable itself is NOT passed to SLF4J,
     * so no stack trace carrying request/document payloads is emitted at this level.
     *
     * @param task            the AI operation performed
     * @param failureCategory the stable failure category (see {@link AiFailureCategory})
     * @param t               the failure cause (only its class name and message are logged)
     */
    public void logFailure(AiTask task, String failureCategory, Throwable t) {
        log.warn("ai_call outcome=FAILURE op={} failureCategory={} exceptionClass={} message={} "
                + "correlationId={} traceId={}",
                task != null ? task.name() : null,
                failureCategory,
                t != null ? t.getClass().getSimpleName() : null,
                t != null ? t.getMessage() : null,
                MDC.get("correlationId"),
                MDC.get("traceId"));
    }
}
