package com.eip.modules.ai.domain.model;

/**
 * A fully built prompt specification handed to the gateway adapter: system
 * instruction, user prompt, optional response JSON schema and a prompt version.
 *
 * <p>Prompt construction lives in the application layer (an {@code AiPromptRegistry}),
 * keeping the provider adapter free of business concerns. The {@code promptVersion}
 * participates in the extraction idempotency key.
 *
 * @param systemInstruction  the system instruction, or {@code null} when none
 * @param userPrompt         the user prompt text
 * @param responseSchemaJson the response JSON schema, or {@code null} when the
 *                           output is free-form text
 * @param promptVersion      the version tag used for cache/idempotency keys
 */
public record AiPromptSpec(
        String systemInstruction,
        String userPrompt,
        String responseSchemaJson,
        String promptVersion) {

    /**
     * Compatibility factory that passes the request input straight through as the
     * user prompt, with no system instruction and no response schema. Used by the
     * legacy gateway contract to preserve current behaviour.
     *
     * @param request the originating request whose input becomes the user prompt
     * @return a passthrough prompt spec tagged {@code "v0-passthrough"}
     */
    public static AiPromptSpec passthrough(AiRequest request) {
        return new AiPromptSpec(null, request.input(), null, "v0-passthrough");
    }
}
