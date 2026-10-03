package com.eip.modules.ai.domain.port.out;

import java.util.Optional;

import com.eip.modules.ai.domain.model.AiResult;

/**
 * Outbound port for the extraction idempotency cache.
 *
 * <p>Keyed by an opaque idempotency key derived from
 * {@code tenantId + documentHash + task + promptVersion + modelVersion}, this
 * cache lets {@code ExtractionIdempotencyService} skip a redundant provider
 * (Gemini) call when the same extraction has already been performed — the second
 * call for the same key is a cache hit returning the previously stored
 * {@link AiResult} (Property 4, Requirements 10.1-10.4).
 *
 * <p>The port is business-agnostic and profile-agnostic: an in-memory adapter
 * backs it today, and a distributed cache (e.g. Redis) can replace the adapter
 * later without touching callers.
 */
public interface ExtractionCachePort {

    /**
     * Looks up a previously stored result for the given idempotency key.
     *
     * @param key the idempotency key
     * @return the cached {@link AiResult}, or {@link Optional#empty()} on a miss
     */
    Optional<AiResult> lookup(String key);

    /**
     * Stores the result for the given idempotency key so a subsequent lookup for
     * the same key is a hit.
     *
     * @param key    the idempotency key
     * @param result the result to cache
     */
    void store(String key, AiResult result);
}
