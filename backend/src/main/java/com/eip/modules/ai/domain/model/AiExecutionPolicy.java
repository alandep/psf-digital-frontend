package com.eip.modules.ai.domain.model;

import java.time.Duration;

/**
 * The execution policy for a single AI call: which model to use, how much
 * reasoning effort to spend and the resource/resilience limits around the call.
 *
 * <p>Resolved in the application layer (never in controllers or in the provider
 * adapter) so the adapter can honour policy without knowing business concerns.
 *
 * @param model          the resolved model route to call
 * @param thinkingLevel  the SEMANTIC reasoning intent (domain) to request from
 *                       the model
 * @param maxOutputTokens the upper bound on generated output tokens
 * @param timeout        the per-call timeout
 * @param maxRetries     the maximum number of retries (must be {@code <= 1};
 *                       only transient failures are retried)
 * @param thinkingSupported whether the model supports thinking at all; gates
 *                       whether the adapter sends {@code thinkingConfig}
 * @param thinkingBudgetTokens the TECHNICAL provider parameter: the thinking
 *                       budget in tokens sent to the provider. Nullable ONLY
 *                       when {@code thinkingSupported} is {@code false} (not
 *                       sent); otherwise it is a required, positive value.
 */
public record AiExecutionPolicy(
        AiModel model,
        AiThinkingLevel thinkingLevel,
        int maxOutputTokens,
        Duration timeout,
        int maxRetries,
        boolean thinkingSupported,
        Integer thinkingBudgetTokens) {

    /**
     * Compatibility factory producing a conservative default policy for the
     * given model: {@link AiThinkingLevel#MEDIUM}, 1024 max output tokens, a
     * 30-second timeout, at most a single retry ({@code maxRetries <= 1}),
     * thinking supported with a sensible MEDIUM budget of 2048 tokens.
     *
     * @param model the model route to wrap in a default policy
     * @return a non-null default policy with {@code maxRetries <= 1}
     */
    public static AiExecutionPolicy defaults(AiModel model) {
        return new AiExecutionPolicy(model, AiThinkingLevel.MEDIUM, 1024,
                Duration.ofSeconds(30), 1, true, 2048);
    }
}
