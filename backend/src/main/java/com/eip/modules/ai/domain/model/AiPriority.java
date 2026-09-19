package com.eip.modules.ai.domain.model;

/**
 * Router priority tiers used to pick a model for a task. Mirrors the
 * {@code priority} column of {@code ai_model_config}.
 */
public enum AiPriority {
    FAST,
    STANDARD,
    DEEP
}
