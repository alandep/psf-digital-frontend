package com.eip.modules.ai.application;

import java.time.Duration;

import org.springframework.stereotype.Service;

import com.eip.modules.ai.domain.model.AiExecutionPolicy;
import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiPriority;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.model.AiThinkingLevel;
import com.eip.modules.ai.domain.port.out.AiExecutionPolicyResolver;
import com.eip.modules.ai.domain.port.out.ModelRouterPort;
import com.eip.platform.error.BusinessRuleException;

import lombok.RequiredArgsConstructor;

/**
 * Default {@link AiExecutionPolicyResolver}: resolves the model route via the
 * {@link ModelRouterPort} (reading the global {@code ai_model_config} catalog)
 * and derives the reasoning effort from the route's {@link AiPriority}.
 *
 * <p><strong>Config, not code.</strong> The model id, the thinking level and the
 * output token cap all come from the router's view of {@code ai_model_config}.
 * When the per-slot {@code thinking_level}/{@code max_output_tokens} columns are
 * set they win; otherwise the thinking level is derived from the configured
 * priority ({@code FAST -> LOW}, {@code STANDARD -> MEDIUM}, {@code DEEP -> HIGH})
 * and the output cap falls back to {@link #DEFAULT_MAX_OUTPUT_TOKENS}. None of
 * this is hardcoded business logic.
 *
 * <p><strong>Profile-agnostic.</strong> This component is intentionally not
 * annotated with {@code @Profile}: it works identically for the mock (default/
 * demo) and cloud profiles. It only becomes wired into the request flow by
 * {@code AiHubService} in a later task, so adding it now is inert and does not
 * change the default/demo behaviour.
 */
@Service
@RequiredArgsConstructor
public class DefaultAiExecutionPolicyResolver implements AiExecutionPolicyResolver {

    /** Default upper bound on generated output tokens when config has no override. */
    private static final int DEFAULT_MAX_OUTPUT_TOKENS = 1024;

    /** Default per-call timeout when config has no override. */
    private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(30);

    /** Maximum retries; must stay {@code <= 1} (only transient failures are retried). */
    private static final int DEFAULT_MAX_RETRIES = 1;

    private final ModelRouterPort router;

    @Override
    public AiExecutionPolicy resolve(AiTask task) {
        ModelRouterPort.AiModelRoute route = router.resolveRoute(task);
        AiModel model = route.model();

        boolean thinkingSupported = route.thinkingSupported();

        // Config override wins; otherwise derive from the route's priority tier.
        AiThinkingLevel thinking = route.thinkingLevel() != null
                ? route.thinkingLevel()
                : thinkingFrom(model.priority());

        // Config override wins; otherwise fall back to the conservative default.
        int maxOutputTokens = route.maxOutputTokens() != null
                ? route.maxOutputTokens()
                : DEFAULT_MAX_OUTPUT_TOKENS;

        // Resolve the TECHNICAL thinking budget from config. Fail explicitly on
        // inconsistent config — no silent fallback.
        Integer thinkingBudgetTokens = resolveThinkingBudget(model, thinkingSupported,
                route.thinkingBudgetTokens());

        return new AiExecutionPolicy(model, thinking, maxOutputTokens,
                DEFAULT_TIMEOUT, DEFAULT_MAX_RETRIES, thinkingSupported, thinkingBudgetTokens);
    }

    /**
     * Resolves the TECHNICAL thinking budget (tokens) for the policy from
     * config, failing explicitly on inconsistent config (no silent fallback):
     * <ul>
     *   <li>when thinking is supported but no {@code thinking_budget_tokens} is
     *       configured ({@code null}) or it is non-positive, throw a
     *       {@link BusinessRuleException};</li>
     *   <li>when thinking is NOT supported, return {@code null} (the budget is
     *       not sent to the provider).</li>
     * </ul>
     *
     * @param model             the resolved model (for the error message)
     * @param thinkingSupported whether the model supports thinking
     * @param configuredBudget  the configured budget from the route (may be
     *                          {@code null})
     * @return the resolved budget, or {@code null} when thinking is unsupported
     * @throws BusinessRuleException when thinking is supported but the config is
     *                               missing/invalid
     */
    private static Integer resolveThinkingBudget(AiModel model, boolean thinkingSupported,
            Integer configuredBudget) {
        if (!thinkingSupported) {
            return null;
        }
        if (configuredBudget == null) {
            throw new BusinessRuleException("Config de IA inconsistente: modelo '" + model.model()
                    + "' suporta thinking mas não tem thinking_budget_tokens configurado em ai_model_config");
        }
        if (configuredBudget <= 0) {
            throw new BusinessRuleException("Config de IA inconsistente: modelo '" + model.model()
                    + "' tem thinking_budget_tokens inválido (" + configuredBudget
                    + ") em ai_model_config; deve ser > 0");
        }
        return configuredBudget;
    }

    /**
     * Maps a router {@link AiPriority} tier to its default reasoning effort:
     * {@code FAST -> LOW}, {@code STANDARD -> MEDIUM}, {@code DEEP -> HIGH}.
     *
     * @param priority the route priority tier
     * @return the derived default thinking level
     */
    private static AiThinkingLevel thinkingFrom(AiPriority priority) {
        return switch (priority) {
            case FAST -> AiThinkingLevel.LOW;
            case STANDARD -> AiThinkingLevel.MEDIUM;
            case DEEP -> AiThinkingLevel.HIGH;
        };
    }
}
