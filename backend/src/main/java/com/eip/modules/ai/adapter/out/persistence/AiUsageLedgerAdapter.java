package com.eip.modules.ai.adapter.out.persistence;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.ai.domain.model.AiLedgerEntry;
import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.port.out.AiUsageLedgerPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter that appends an {@code ai_usage_event} row for each AI
 * operation, forming the authoritative usage ledger.
 */
@Component
@RequiredArgsConstructor
public class AiUsageLedgerAdapter implements AiUsageLedgerPort {

    private final AiUsageEventJpaRepository jpa;

    @Override
    public void record(UUID org, UUID userId, AiTask task, AiResult result, String requestId,
            BigDecimal providerCost) {
        AiUsageEventEntity entity = new AiUsageEventEntity();
        entity.setId(UUID.randomUUID());
        entity.setOrganizationId(org);
        entity.setUserId(userId);
        entity.setOperation(task.name());
        entity.setProvider(result.provider());
        entity.setModel(result.model());
        entity.setInputUnits(result.inputUnits());
        entity.setOutputUnits(result.outputUnits());
        entity.setOcrPages(result.ocrPages());
        // Phase 1: real telemetry persisted into the V19 columns. input_units/output_units
        // keep mirroring promptTokens/outputTokens via the AiResult.of factory invariant.
        entity.setThinkingTokens(result.thinkingTokens());
        entity.setTotalTokens(result.totalTokens());
        entity.setFinishReason(result.finishReason());
        entity.setLatencyMs(result.latencyMs()); // long auto-boxes to Long
        // FinOps: provider_cost is computed in the application/worker layer via
        // AiPriceCatalogPort (never in the Vertex adapter) and persisted here (Req 11.1, 11.2).
        entity.setProviderCost(providerCost);
        entity.setRequestId(requestId);
        entity.setCreatedAt(OffsetDateTime.now());
        jpa.save(entity);
    }

    @Override
    public void recordOutcome(AiLedgerEntry entry) {
        // Shares the caller's transaction (used for the SUCCESS path, which commits with it).
        persistOutcome(entry);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailureOutcome(AiLedgerEntry entry) {
        // Commits in its OWN transaction so the FAILURE row survives the rollback of the
        // caller's transaction when the failing exception is rethrown (Req 9.2).
        persistOutcome(entry);
    }

    private void persistOutcome(AiLedgerEntry entry) {
        AiUsageEventEntity entity = new AiUsageEventEntity();
        entity.setId(UUID.randomUUID());
        entity.setOrganizationId(entry.org());
        entity.setUserId(entry.userId());
        entity.setOperation(entry.task().name());
        entity.setRequestId(entry.requestId());
        entity.setCreatedAt(OffsetDateTime.now());
        // Outcome-aware observability (Req 9.2): outcome + failure category + trace id.
        entity.setOutcome(entry.outcome() != null ? entry.outcome().name() : null);
        entity.setFailureCategory(entry.failureCategory());
        entity.setTraceId(entry.traceId());
        // A pure FAILURE may carry no provider telemetry: handle a null result gracefully,
        // leaving the telemetry columns at their entity defaults rather than dereferencing it.
        AiResult result = entry.result();
        if (result != null) {
            // Mirror the legacy record(...) telemetry mapping (V19 columns). Redaction
            // (Req 9.6, 11.4): AiResult.output is NEVER persisted — only aggregate telemetry.
            entity.setProvider(result.provider());
            entity.setModel(result.model());
            entity.setInputUnits(result.inputUnits());
            entity.setOutputUnits(result.outputUnits());
            entity.setOcrPages(result.ocrPages());
            entity.setThinkingTokens(result.thinkingTokens());
            entity.setTotalTokens(result.totalTokens());
            entity.setFinishReason(result.finishReason());
            entity.setLatencyMs(result.latencyMs()); // long auto-boxes to Long
        }
        // FinOps provider_cost is set regardless of telemetry presence (may be null).
        entity.setProviderCost(entry.providerCost());
        jpa.save(entity);
    }
}
