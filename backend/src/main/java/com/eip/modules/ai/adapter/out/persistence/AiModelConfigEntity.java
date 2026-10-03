package com.eip.modules.ai.adapter.out.persistence;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JPA entity mapping the GLOBAL {@code ai_model_config} router catalog
 * (not tenant-scoped, no RLS).
 */
@Entity
@Table(name = "ai_model_config")
@Getter
@Setter
@NoArgsConstructor
public class AiModelConfigEntity {

    @Id
    private UUID id;

    @Column(name = "provider", nullable = false)
    private String provider;

    @Column(name = "model", nullable = false)
    private String model;

    @Column(name = "task", nullable = false)
    private String task;

    @Column(name = "priority", nullable = false)
    private String priority;

    @Column(name = "cost_class")
    private String costClass;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    /**
     * Optional per-slot reasoning effort override ({@code "LOW"}/{@code "MEDIUM"}/
     * {@code "HIGH"}) added in V19 and populated in V21. {@code null} means
     * "derive from priority / YAML default".
     */
    @Column(name = "thinking_level")
    private String thinkingLevel;

    /**
     * Optional per-slot output token cap override added in V19 and populated in
     * V21. {@code null} means "use the resolver's default".
     */
    @Column(name = "max_output_tokens")
    private Integer maxOutputTokens;

    /**
     * The provider THINKING BUDGET in tokens (Gemini {@code thinkingConfig
     * .thinkingBudget}) added in V22. Semantically DISTINCT from
     * {@link #maxOutputTokens}. Nullable: when the model supports thinking this
     * must be set, otherwise the resolver fails fast; when the model does not
     * support thinking it is ignored.
     */
    @Column(name = "thinking_budget_tokens")
    private Integer thinkingBudgetTokens;

    /**
     * Whether the model supports thinking at all (V22). When {@code false} the
     * adapter must NOT send {@code thinkingConfig}. Defaults to {@code true}.
     */
    @Column(name = "thinking_supported", nullable = false)
    private boolean thinkingSupported = true;
}
