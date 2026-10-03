package com.eip.modules.ai.domain.port.out;

import java.util.List;

import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.model.AiThinkingLevel;

/**
 * Outbound port that resolves which model serves a given task, reading the
 * global {@code ai_model_config} catalog.
 */
public interface ModelRouterPort {

    /** Resolves the model to use for {@code task} by the default priority strategy. */
    AiModel resolve(AiTask task);

    /**
     * Resolves the model route for {@code task} together with its optional
     * per-slot thinking config read from {@code ai_model_config}
     * ({@code thinking_level} / {@code max_output_tokens}). This keeps the
     * {@link AiModel} catalog record lean: thinking config travels alongside the
     * model instead of being baked into it.
     *
     * @param task the task to resolve
     * @return the resolved model plus its (possibly {@code null}) thinking config
     */
    AiModelRoute resolveRoute(AiTask task);

    /** Lists all enabled router entries. */
    List<AiModel> all();

    /**
     * A resolved model route plus the per-slot thinking config from
     * {@code ai_model_config}. The {@code thinkingLevel}/{@code maxOutputTokens}/
     * {@code thinkingBudgetTokens} fields are nullable: {@code null} means the
     * application layer should fall back to its priority-derived / default
     * values (or, for the budget, fail fast when thinking is supported).
     *
     * @param model                the resolved model to call
     * @param thinkingLevel        the configured reasoning effort override
     *                             ({@code thinking_level}), or {@code null} when
     *                             unset
     * @param maxOutputTokens      the configured output token cap override
     *                             ({@code max_output_tokens}), or {@code null}
     *                             when unset
     * @param thinkingSupported    whether the model supports thinking
     *                             ({@code thinking_supported}); when {@code false}
     *                             the adapter must skip {@code thinkingConfig}
     * @param thinkingBudgetTokens the provider thinking budget in tokens
     *                             ({@code thinking_budget_tokens}), DISTINCT from
     *                             {@code maxOutputTokens}; {@code null} when unset
     */
    record AiModelRoute(AiModel model, AiThinkingLevel thinkingLevel, Integer maxOutputTokens,
                        boolean thinkingSupported, Integer thinkingBudgetTokens) {}
}
