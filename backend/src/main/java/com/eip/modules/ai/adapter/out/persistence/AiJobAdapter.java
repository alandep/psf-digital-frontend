package com.eip.modules.ai.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.port.out.AiJobPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter for the {@code ai_job} queue.
 *
 * <p>TODO: add an {@code @Scheduled} worker (modelled on the platform
 * OutboxWorker) that claims QUEUED jobs with {@code FOR UPDATE SKIP LOCKED},
 * calls the {@link com.eip.modules.ai.domain.port.out.AiGatewayPort}, records
 * usage into the ledger and updates the job status. Not implemented in this
 * slice — enqueue/status only.
 */
@Component
@RequiredArgsConstructor
public class AiJobAdapter implements AiJobPort {

    private final AiJobJpaRepository jpa;

    @Override
    public UUID enqueue(UUID org, UUID userId, AiTask task, String input) {
        OffsetDateTime now = OffsetDateTime.now();
        AiJobEntity entity = new AiJobEntity();
        entity.setId(UUID.randomUUID());
        entity.setOrganizationId(org);
        entity.setUserId(userId);
        entity.setTask(task.name());
        entity.setStatus("QUEUED");
        entity.setInputRef(input);
        entity.setAttempts(0);
        entity.setCreatedAt(now);
        entity.setAvailableAt(now);
        jpa.save(entity);
        return entity.getId();
    }

    @Override
    public Optional<AiJobSnapshot> status(UUID jobId, UUID org) {
        return jpa.findByIdAndOrganizationId(jobId, org)
                .map(e -> new AiJobSnapshot(e.getId(), e.getStatus(),
                        e.getResultRef(), e.getError()));
    }
}
