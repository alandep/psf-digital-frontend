package com.eip.modules.ai.domain.model;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

/**
 * Resultado estruturado de uma simulação de transporte produzida pela IA: a
 * transportadora e o modal recomendados, a rota, a justificativa e, quando
 * disponíveis, as estimativas de prazo de trânsito e de custo.
 *
 * @param carrier               a transportadora recomendada
 * @param modal                 o modal de transporte recomendado
 * @param route                 a rota sugerida
 * @param rationale             a justificativa textual da recomendação
 * @param estimatedTransitDays  o prazo estimado de trânsito em dias (opcional)
 * @param estimatedCost         o custo estimado da operação (opcional)
 */
public record TransportSimulation(
        @NotBlank String carrier,
        @NotBlank String modal,
        @NotBlank String route,
        @NotBlank String rationale,
        Integer estimatedTransitDays,
        BigDecimal estimatedCost) {}
