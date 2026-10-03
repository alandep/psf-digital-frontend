package com.eip.modules.ai.domain.port.out;

import com.eip.modules.ai.domain.model.AiPromptSpec;
import com.eip.modules.ai.domain.model.AiTask;

/**
 * Outbound port that builds the prompt specification for a given {@link AiTask}.
 *
 * <p>Prompt construction (system instruction, user prompt template and optional
 * response JSON schema) lives behind this port in the application layer, NOT in
 * the Vertex gateway adapter. This keeps the provider adapter business-agnostic:
 * it never needs to know what an NCM, invoice or packing list is — it only
 * receives a ready-made {@link AiPromptSpec} (Requirements 6.3, 6.4).
 *
 * <p>The {@link #promptVersion(AiTask)} value feeds the extraction idempotency
 * key, so prompt changes invalidate cached results (wired in task 9.3).
 */
public interface AiPromptRegistry {

    /**
     * Builds the prompt specification for the given task and input.
     *
     * @param task  the AI task that selects the system instruction / template
     * @param input the raw user input to embed in the user prompt
     * @return a fully built {@link AiPromptSpec} (system instruction, user prompt,
     *         optional response schema and prompt version)
     */
    AiPromptSpec specFor(AiTask task, String input);

    /**
     * Returns a stable, per-task prompt version string. The value is used as part
     * of the extraction idempotency key (task 9.3) so a prompt change produces a
     * new key and invalidates stale cache entries.
     *
     * @param task the AI task
     * @return a stable version string for the task's prompt
     */
    String promptVersion(AiTask task);
}
