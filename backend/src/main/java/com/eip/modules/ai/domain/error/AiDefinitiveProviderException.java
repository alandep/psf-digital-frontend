package com.eip.modules.ai.domain.error;

/**
 * Falha definitiva (não transitória): o provedor de IA retornou um erro que não é
 * passível de retry. Mapeada para 502 pelo handler.
 */
public final class AiDefinitiveProviderException extends AiProviderException {

    private static final String CODE = "AI_PROVIDER_ERROR";

    /**
     * @param message mensagem técnica da falha
     * @param cause   causa raiz (pode ser {@code null})
     */
    public AiDefinitiveProviderException(String message, Throwable cause) {
        super(CODE, message, false, cause);
    }

    /**
     * @param message mensagem técnica da falha
     */
    public AiDefinitiveProviderException(String message) {
        super(CODE, message, false, null);
    }
}
