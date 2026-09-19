package com.eip.modules.ai.domain.model;

/**
 * The outcome of an AI operation, including the metering signals that feed the
 * usage ledger ({@code input_units}, {@code output_units}, {@code ocr_pages}).
 *
 * @param output      the produced output
 * @param provider    the provider that served the request
 * @param model       the model that served the request
 * @param inputUnits  billable input units consumed
 * @param outputUnits billable output units produced
 * @param ocrPages    OCR pages processed (0 when not applicable)
 */
public record AiResult(String output, String provider, String model,
        long inputUnits, long outputUnits, int ocrPages) {
}
