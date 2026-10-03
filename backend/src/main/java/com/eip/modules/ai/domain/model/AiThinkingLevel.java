package com.eip.modules.ai.domain.model;

/**
 * The reasoning ("thinking") effort an AI model should spend on a request.
 *
 * <p>This is a first-class, provider-agnostic concept carried by
 * {@link AiExecutionPolicy} rather than by {@link AiModel}: the catalog model is
 * widely referenced, so thinking lives on the resolved execution policy instead.
 * The effective level is derived from {@link AiPriority} (and optional config
 * overrides) by the application layer.
 */
public enum AiThinkingLevel {
    /** Minimal reasoning effort (maps from {@link AiPriority#FAST}). */
    LOW,
    /** Balanced reasoning effort (maps from {@link AiPriority#STANDARD}). */
    MEDIUM,
    /** Maximum reasoning effort (maps from {@link AiPriority#DEEP}). */
    HIGH
}
