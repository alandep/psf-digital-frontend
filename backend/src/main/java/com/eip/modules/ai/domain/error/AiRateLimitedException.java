package com.eip.modules.ai.domain.error;

import java.time.Duration;

/**
 * Falha transitória: o provedor de IA limitou a taxa de requisições (HTTP 429).
 * Mapeada para 429 pelo handler, propagando {@code Retry-After} quando presente.
 */
public final class AiRateLimitedException extends AiProviderException {

    private static final String CODE = "AI_RATE_LIMITED";

    /** Tempo sugerido de espera (do header {@code Retry-After}); pode ser {@code null}. */
    private final Duration retryAfter;

    /**
     * @param message    mensagem técnica da falha
     * @param retryAfter tempo sugerido de espera (pode ser {@code null})
     * @param cause      causa raiz (pode ser {@code null})
     */
    public AiRateLimitedException(String message, Duration retryAfter, Throwable cause) {
        super(CODE, message, true, cause);
        this.retryAfter = retryAfter;
    }

    /**
     * @param message    mensagem técnica da falha
     * @param retryAfter tempo sugerido de espera (pode ser {@code null})
     */
    public AiRateLimitedException(String message, Duration retryAfter) {
        super(CODE, message, true, null);
        this.retryAfter = retryAfter;
    }

    /** @return o tempo sugerido de espera (do {@code Retry-After}); pode ser {@code null}. */
    public Duration retryAfter() {
        return retryAfter;
    }
}
