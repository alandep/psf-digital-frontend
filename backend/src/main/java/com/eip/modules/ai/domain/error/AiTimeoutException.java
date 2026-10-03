package com.eip.modules.ai.domain.error;

/**
 * Falha transitória: o provedor de IA não respondeu dentro do tempo limite
 * (read/connect timeout). Mapeada para 504 pelo handler.
 */
public final class AiTimeoutException extends AiProviderException {

    private static final String CODE = "AI_TIMEOUT";

    /**
     * @param message mensagem técnica da falha
     * @param cause   causa raiz (pode ser {@code null})
     */
    public AiTimeoutException(String message, Throwable cause) {
        super(CODE, message, true, cause);
    }

    /**
     * @param message mensagem técnica da falha
     */
    public AiTimeoutException(String message) {
        super(CODE, message, true, null);
    }
}
