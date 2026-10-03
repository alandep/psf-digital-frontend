package com.eip.modules.ai.adapter.out.ai;

import org.springframework.stereotype.Component;

import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiResult;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Maps a Vertex AI Gemini {@code generateContent} response into the metering
 * telemetry carried by {@link AiResult}.
 *
 * <p>This is pure transport-level mapping — it extracts the produced text, the
 * finish reason and the token counts from the provider's {@code usageMetadata}
 * and hands them to {@link AiResult#of}. It knows nothing about NCM, invoices or
 * any business concern; the business lives in the prompt registry. Extracting
 * this logic into a small, dependency-free component keeps it unit-testable
 * (task 5.10) and keeps the adapter focused on transport + ADC.
 *
 * <p>Field mapping ({@code usageMetadata} → {@link AiResult}):
 * <ul>
 *   <li>{@code promptTokenCount}     → {@code promptTokens} (and {@code inputUnits})</li>
 *   <li>{@code candidatesTokenCount} → {@code outputTokens} (and {@code outputUnits})</li>
 *   <li>{@code thoughtsTokenCount}   → {@code thinkingTokens} (absent ⇒ 0)</li>
 *   <li>{@code totalTokenCount}      → {@code totalTokens}</li>
 * </ul>
 * The output text is the concatenation of {@code candidates[0].content.parts[*].text}
 * and the finish reason is {@code candidates[0].finishReason}.
 */
@Component
public class AiTelemetryMapper {

    /**
     * Builds an {@link AiResult} from a Gemini {@code generateContent} response.
     *
     * @param model     the resolved model route that served the request (provides
     *                  the provider/model identifiers recorded in the result)
     * @param response  the parsed JSON response body from Gemini
     * @param latencyMs the measured end-to-end provider latency in milliseconds
     * @return the AI result with real token telemetry
     */
    public AiResult toResult(AiModel model, JsonNode response, long latencyMs) {
        JsonNode candidates = response.path("candidates");
        JsonNode firstCandidate = candidates.path(0);

        String output = extractOutputText(firstCandidate);
        String finishReason = firstCandidate.path("finishReason").asText(null);

        JsonNode usage = response.path("usageMetadata");
        long promptTokens = usage.path("promptTokenCount").asLong(0);
        long outputTokens = usage.path("candidatesTokenCount").asLong(0);
        long thinkingTokens = usage.path("thoughtsTokenCount").asLong(0);
        long totalTokens = usage.path("totalTokenCount").asLong(0);

        return AiResult.of(output, model.provider(), model.model(), 0,
                promptTokens, outputTokens, thinkingTokens, totalTokens, finishReason, latencyMs);
    }

    /**
     * Concatenates the {@code text} of every part in {@code content.parts}.
     *
     * @param candidate the first candidate node (or an empty node)
     * @return the concatenated output text (empty string when none)
     */
    private static String extractOutputText(JsonNode candidate) {
        JsonNode parts = candidate.path("content").path("parts");
        if (!parts.isArray()) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (JsonNode part : parts) {
            JsonNode text = part.path("text");
            if (text.isTextual()) {
                sb.append(text.asText());
            }
        }
        return sb.toString();
    }
}
