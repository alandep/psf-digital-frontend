package com.eip.modules.ai.domain.error;

/**
 * Falha transitória: o provedor de IA está indisponível porque o disjuntor
 * (circuit breaker) está aberto (OPEN). Mapeada para 503 pelo handler.
 */
public final class AiProviderUnavailableException extends AiProviderException {

    private static final String CODE = "AI_UNAVAILABLE";

    /**
     * @param message mensagem técnica da falha
     * @param cause   causa raiz (pode ser {@code null})
     */
    public AiProviderUnavailableException(String message, Throwable cause) {
        super(CODE, message, true, cause);
    }

    /**
     * @param message mensagem técnica da falha
     */
    public AiProviderUnavailableException(String message) {
        super(CODE, message, true, null);
    }
}
