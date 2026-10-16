package com.eip.modules.ai.domain.model;

import jakarta.validation.constraints.NotBlank;

/**
 * Classificação NCM alternativa sugerida pela IA, com a respectiva confiança e a
 * justificativa que motivou a sugestão.
 *
 * @param ncm        o código NCM alternativo
 * @param confidence o grau de confiança (0..1) atribuído à alternativa
 * @param reason     a justificativa para a sugestão desta alternativa
 */
public record NcmAlternative(
        @NotBlank String ncm,
        double confidence,
        String reason) {}
