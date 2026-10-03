package com.eip.modules.ai.adapter.out.cache;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Component;

import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.port.out.ExtractionCachePort;

/**
 * In-memory {@link ExtractionCachePort} adapter backing the extraction
 * idempotency cache with a thread-safe {@link ConcurrentHashMap}.
 *
 * <p>This is a simple, profile-agnostic implementation suitable for a single
 * instance / the demo. It is bounded by a soft entry cap: once {@link #MAX_ENTRIES}
 * is reached the map is cleared before accepting new entries, keeping memory in
 * check without evicting mid-store.
 *
 * <p>TODO: replace with a distributed cache (e.g. Redis) for multi-instance
 * deployments so idempotency holds across nodes and survives restarts. The
 * {@link ExtractionCachePort} contract is intentionally minimal to make that
 * swap transparent to callers.
 */
@Component
public class ExtractionCacheAdapter implements ExtractionCachePort {

    /** Soft upper bound on cached entries before the map is reset. */
    private static final int MAX_ENTRIES = 10_000;

    private final ConcurrentMap<String, AiResult> cache = new ConcurrentHashMap<>();

    @Override
    public Optional<AiResult> lookup(String key) {
        return Optional.ofNullable(cache.get(key));
    }

    @Override
    public void store(String key, AiResult result) {
        if (cache.size() >= MAX_ENTRIES && !cache.containsKey(key)) {
            // Bounded best-effort eviction: reset when the soft cap is hit. A
            // distributed cache (see class TODO) would use proper LRU/TTL instead.
            cache.clear();
        }
        cache.put(key, result);
    }
}
