package com.eip.modules.ai.domain.model;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

/**
 * Resultado estruturado de uma classificação NCM produzida pela IA: o código
 * recomendado, o grau de confiança, a justificativa e eventuais alternativas.
 *
 * @param ncm          o código NCM recomendado
 * @param confidence   o grau de confiança (0..1) da recomendação principal
 * @param rationale    a justificativa textual da recomendação
 * @param alternatives alternativas sugeridas (pode ser vazia), cada uma validada
 */
public record NcmClassification(
        @NotBlank String ncm,
        double confidence,
        String rationale,
        @Valid List<NcmAlternative> alternatives) {}
