package com.eip.modules.ai.domain.error;

/**
 * Base para falhas do provedor de IA relacionadas a transporte/disponibilidade.
 *
 * <p>Carrega um {@code code} estável e a flag {@code transientFailure} (passível de
 * retry/espera). Estas exceções NÃO conhecem HTTP — o mapeamento para status vive no
 * handler ({@code AiExceptionHandler}).</p>
 */
public abstract class AiProviderException extends RuntimeException {

    private final String code;
    private final boolean transientFailure;

    /**
     * @param code             código estável da falha (ex.: {@code AI_TIMEOUT})
     * @param message          mensagem técnica da falha
     * @param transientFailure {@code true} quando a falha é passível de retry/espera
     * @param cause            causa raiz (pode ser {@code null})
     */
    protected AiProviderException(String code, String message, boolean transientFailure, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.transientFailure = transientFailure;
    }

    /** @return o código estável desta falha. */
    public String code() {
        return code;
    }

    /** @return {@code true} quando a falha é transitória (passível de retry/espera). */
    public boolean isTransient() {
        return transientFailure;
    }
}
