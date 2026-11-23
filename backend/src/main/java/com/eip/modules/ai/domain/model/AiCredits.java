package com.eip.modules.ai.domain.model;

import java.math.BigDecimal;

/**
 * Fórmula de créditos de IA (contrato de billing, §1):
 * {@code ceil((entrada + 5 × (saída + raciocínio)) / 1000)}, com mínimo de 1 crédito por
 * chamada que tenha algum token. Chamadas sem tokens não consomem créditos.
 */
public final class AiCredits {

    private static final long OUTPUT_WEIGHT = 5L;
    private static final long TOKENS_PER_CREDIT = 1000L;

    private AiCredits() {
    }

    /**
     * @param inputTokens    tokens de entrada (prompt)
     * @param outputTokens   tokens de saída
     * @param thinkingTokens tokens de raciocínio
     * @return créditos consumidos (inteiro, em {@link BigDecimal}); zero quando não há tokens
     */
    public static BigDecimal of(long inputTokens, long outputTokens, long thinkingTokens) {
        long in = Math.max(0L, inputTokens);
        long out = Math.max(0L, outputTokens);
        long thinking = Math.max(0L, thinkingTokens);
        if (in + out + thinking <= 0L) {
            return BigDecimal.ZERO;
        }
        long weighted = in + OUTPUT_WEIGHT * (out + thinking);
        long credits = Math.max(1L, Math.ceilDiv(weighted, TOKENS_PER_CREDIT));
        return BigDecimal.valueOf(credits);
    }
}
