package com.eip.modules.ai.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.stereotype.Component;

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
    public void record(UUID org, UUID userId, AiTask task, AiResult result, String requestId) {
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
        entity.setRequestId(requestId);
        entity.setCreatedAt(OffsetDateTime.now());
        jpa.save(entity);
    }
}
