package com.eip.modules.ai.domain.error;

/**
 * Falha de CONTEÚDO da resposta do provedor de IA (não de transporte): nunca transitória.
 *
 * <p>Representa respostas inutilizáveis (JSON malformado, schema inválido, campos
 * ausentes/tipos errados, output vazio, resposta truncada ou bloqueada por segurança).
 * Mapeada para 422 {@code AI_RESPONSE_INVALID} pelo handler.</p>
 */
public final class AiResponseException extends RuntimeException {

    /** Natureza específica da falha de conteúdo. */
    public enum Kind {
        MALFORMED_JSON,
        SCHEMA_INVALID,
        MISSING_FIELDS,
        WRONG_TYPES,
        EMPTY_OUTPUT,
        TRUNCATED,
        BLOCKED_SAFETY
    }

    private final Kind kind;

    /**
     * @param kind    natureza específica da falha de conteúdo
     * @param message mensagem técnica da falha
     */
    public AiResponseException(Kind kind, String message) {
        super(message);
        this.kind = kind;
    }

    /**
     * @param kind    natureza específica da falha de conteúdo
     * @param message mensagem técnica da falha
     * @param cause   causa raiz (pode ser {@code null})
     */
    public AiResponseException(Kind kind, String message, Throwable cause) {
        super(message, cause);
        this.kind = kind;
    }

    /** @return a natureza específica da falha de conteúdo. */
    public Kind kind() {
        return kind;
    }
}
