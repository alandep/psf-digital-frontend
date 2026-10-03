package com.eip.modules.ai.domain.port.out;

import com.eip.modules.ai.domain.model.AiExecutionPolicy;
import com.eip.modules.ai.domain.model.AiTask;

/**
 * Resolves the {@link AiExecutionPolicy} for a task in a single place — never in
 * controllers and never in the provider adapter.
 *
 * <p>The resolved policy carries the config-driven model route (from the router
 * over {@code ai_model_config}) together with the derived reasoning effort and
 * resource/resilience limits. Model id and thinking level are configuration
 * (router + priority mapping, optionally overridden by config); they are never
 * hardcoded business logic.
 */
public interface AiExecutionPolicyResolver {

    /**
     * Resolves the execution policy for {@code task}.
     *
     * @param task the task to resolve a policy for; must not be {@code null}
     * @return a non-null policy with {@code maxRetries <= 1}
     */
    AiExecutionPolicy resolve(AiTask task);
}
