package com.eip.modules.ai.domain.model;

/**
 * A resolved model route: the provider and model id the gateway should call for
 * a given task/priority. Model ids are configuration values (from
 * {@code ai_model_config}), never hardcoded in the domain.
 *
 * @param provider  the AI provider identifier (e.g. {@code vertex-ai})
 * @param model     the provider-specific model id (tunable config)
 * @param task      the task this route serves
 * @param priority  the priority tier of this route
 * @param costClass a coarse cost bucket (e.g. {@code low}/{@code medium}/{@code high})
 */
public record AiModel(String provider, String model, AiTask task, AiPriority priority, String costClass) {
}
