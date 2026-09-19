package com.eip.modules.ai.domain.port.in;

import java.util.UUID;

/**
 * Inbound port for running AI analyses. Small tasks run synchronously; heavy
 * tasks are enqueued as {@code ai_job}s and processed asynchronously.
 */
public interface AnalyzeUseCase {

    /**
     * Runs a synchronous analysis (e.g. NCM classification) and returns the
     * result, having metered usage and checked the tenant's AI franquia.
     */
    AnalysisView analyze(AnalyzeCommand cmd);

    /**
     * Enqueues an {@code ai_job} for a heavy task and returns its id (202-style).
     */
    JobView analyzeAsync(AnalyzeCommand cmd);

    /** Reads the current status of a previously enqueued job. */
    JobView jobStatus(UUID jobId);

    /**
     * Request to analyze an input for a given task.
     *
     * @param task  the {@link com.eip.modules.ai.domain.model.AiTask} name
     * @param input the raw input to analyze
     */
    record AnalyzeCommand(String task, String input) {
    }

    /** The result of a synchronous analysis, including metering signals. */
    record AnalysisView(String task, String output, String provider, String model,
            long inputUnits, long outputUnits, int ocrPages) {
    }

    /** A reference to an asynchronous job and its current status. */
    record JobView(UUID jobId, String status) {
    }
}
