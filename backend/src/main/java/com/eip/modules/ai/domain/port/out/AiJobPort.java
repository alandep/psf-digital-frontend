package com.eip.modules.ai.domain.port.out;

import java.util.Optional;
import java.util.UUID;

import com.eip.modules.ai.domain.model.AiTask;

/**
 * Outbound port for the asynchronous job queue ({@code ai_job}).
 */
public interface AiJobPort {

    /** Enqueues a QUEUED job and returns its id. */
    UUID enqueue(UUID org, UUID userId, AiTask task, String input);

    /** Reads a job snapshot scoped to the org, if present. */
    Optional<AiJobSnapshot> status(UUID jobId, UUID org);

    /** A point-in-time view of a job. */
    record AiJobSnapshot(UUID id, String status, String resultRef, String error) {
    }
}
