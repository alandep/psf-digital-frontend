package com.eip.modules.ai.domain.error;

/**
 * Falha transitória: o provedor de IA retornou um erro de servidor (HTTP 5xx)
 * passível de retry. Mapeada para 503 pelo handler.
 */
public final class AiTransientProviderException extends AiProviderException {

    private static final String CODE = "AI_PROVIDER_ERROR";

    /**
     * @param message mensagem técnica da falha
     * @param cause   causa raiz (pode ser {@code null})
     */
    public AiTransientProviderException(String message, Throwable cause) {
        super(CODE, message, true, cause);
    }

    /**
     * @param message mensagem técnica da falha
     */
    public AiTransientProviderException(String message) {
        super(CODE, message, true, null);
    }
}
