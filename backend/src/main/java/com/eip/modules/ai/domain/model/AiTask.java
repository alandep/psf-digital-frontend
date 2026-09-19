package com.eip.modules.ai.domain.model;

/**
 * The kinds of AI operations the hub can perform. Values mirror the
 * {@code task} column of {@code ai_model_config} and the {@code operation}
 * recorded in {@code ai_usage_event}.
 */
public enum AiTask {
    NCM_CLASSIFICATION,
    DOCUMENT_SUMMARY,
    TRANSLATION,
    RISK_ANALYSIS,
    DOCUMENT_EXTRACTION,
    CHAT
}
