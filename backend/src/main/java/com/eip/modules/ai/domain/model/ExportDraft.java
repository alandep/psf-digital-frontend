package com.eip.modules.ai.domain.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Rascunho de exportação extraído de um comando em linguagem natural pela IA.
 * Agrega os dados mínimos para pré-preencher uma exportação, que SEMPRE passa
 * por revisão humana antes de ser efetivada (humano no circuito).
 *
 * @param incoterm    o Incoterm acordado (obrigatório)
 * @param origin      a origem da mercadoria (obrigatório)
 * @param destination o destino da mercadoria (obrigatório)
 * @param product     a descrição do produto (obrigatório)
 * @param ncm         o código NCM sugerido (opcional, pode ser null)
 * @param quantity    a quantidade (obrigatório)
 * @param unit        a unidade de medida (obrigatório)
 * @param notes       observações adicionais (opcional, pode ser null)
 */
public record ExportDraft(
        @NotBlank String incoterm,
        @NotBlank String origin,
        @NotBlank String destination,
        @NotBlank String product,
        String ncm,
        @NotNull BigDecimal quantity,
        @NotBlank String unit,
        String notes) {}
