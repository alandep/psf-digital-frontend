package com.eip.modules.ai.domain.model;

/**
 * The outcome of an AI operation, including the metering signals that feed the
 * usage ledger ({@code input_units}, {@code output_units}, {@code ocr_pages}) and
 * the real token telemetry captured from the provider ({@code usageMetadata}).
 *
 * <p>Compatibility invariants (see Property 1 — metering invariants):
 * <ul>
 *   <li>{@code inputUnits == promptTokens} and {@code outputUnits == outputTokens},
 *       so the ledger keeps recording real tokens in {@code input_units}/{@code output_units};</li>
 *   <li>{@code totalTokens >= promptTokens + outputTokens} (may also include thinking tokens).</li>
 * </ul>
 *
 * @param output        the produced output
 * @param provider      the provider that served the request
 * @param model         the model that served the request
 * @param inputUnits    billable input units consumed (kept equal to {@code promptTokens})
 * @param outputUnits   billable output units produced (kept equal to {@code outputTokens})
 * @param ocrPages      OCR pages processed (0 when not applicable)
 * @param promptTokens  real prompt tokens reported by the provider
 * @param outputTokens  real output (candidate) tokens reported by the provider
 * @param thinkingTokens real thinking tokens reported by the provider (0 when not applicable)
 * @param totalTokens   total tokens reported by the provider ({@code >= promptTokens + outputTokens})
 * @param finishReason  the provider finish reason (e.g. {@code STOP})
 * @param latencyMs     end-to-end provider latency in milliseconds
 */
public record AiResult(
        String output,
        String provider,
        String model,
        long inputUnits,
        long outputUnits,
        int ocrPages,
        long promptTokens,
        long outputTokens,
        long thinkingTokens,
        long totalTokens,
        String finishReason,
        long latencyMs) {

    /**
     * Compatibility factory: derives the legacy metering fields from the real token
     * telemetry, enforcing the ledger invariant {@code inputUnits == promptTokens} and
     * {@code outputUnits == outputTokens}.
     */
    public static AiResult of(String output, String provider, String model, int ocrPages,
                              long promptTokens, long outputTokens, long thinkingTokens,
                              long totalTokens, String finishReason, long latencyMs) {
        return new AiResult(output, provider, model, promptTokens, outputTokens, ocrPages,
                promptTokens, outputTokens, thinkingTokens, totalTokens, finishReason, latencyMs);
    }
}
