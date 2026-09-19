package com.eip.modules.ai.adapter.in.worker;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.ai.adapter.out.persistence.AiJobEntity;
import com.eip.modules.ai.adapter.out.persistence.AiJobJpaRepository;
import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiRequest;
import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.port.out.AiGatewayPort;
import com.eip.modules.ai.domain.port.out.AiUsageLedgerPort;
import com.eip.modules.ai.domain.port.out.ModelRouterPort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Processes a single {@code ai_job} inside its own transaction.
 *
 * <p><strong>RLS-per-job rationale:</strong> the worker runs on a background
 * thread with no request context. Tenant tables are RLS-protected and require
 * {@code app.current_organization} to be bound per transaction. The
 * {@link com.eip.platform.tenant.RlsAspect} binds that value {@code @Before}
 * each {@code @Transactional} unit of work by reading
 * {@link com.eip.platform.tenant.OrganizationContextHolder}. The caller
 * ({@code AiJobWorker}) sets the holder to the job's organization <em>before</em>
 * invoking this method, so this transaction is correctly scoped to that tenant.
 * A separate {@code @Component} (this class) is required so the Spring AOP proxy
 * applies the aspect on the call — a self-invocation would bypass it.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiJobProcessor {

    private static final int MAX_ERROR_LENGTH = 1000;

    private final AiJobJpaRepository jobs;
    private final ModelRouterPort router;
    private final AiGatewayPort gateway;
    private final AiUsageLedgerPort ledger;

    /** A claimed job reduced to what the processing loop needs. */
    public record Claim(UUID id, UUID organizationId) {
    }

    /**
     * Claims a batch of due QUEUED jobs and marks them {@code PROCESSING} in a
     * single short transaction, returning the lightweight claims to process.
     * Lives on this bean (not the worker) so the {@code @Transactional} proxy
     * applies — a self-invocation from the scheduled poll would bypass it.
     */
    @Transactional
    public List<Claim> claimAndMark(int batchSize) {
        List<AiJobEntity> batch = jobs.claimBatch(batchSize);
        List<Claim> claims = new ArrayList<>(batch.size());
        for (AiJobEntity job : batch) {
            job.setStatus("PROCESSING");
            jobs.save(job);
            claims.add(new Claim(job.getId(), job.getOrganizationId()));
        }
        return claims;
    }

    /**
     * Completes the job identified by {@code jobId}. The caller must have bound
     * the job's organization to {@code OrganizationContextHolder} before calling
     * this method so RLS is applied for the correct tenant.
     */
    @Transactional
    public void complete(UUID jobId) {
        AiJobEntity job = jobs.findById(jobId).orElse(null);
        if (job == null) {
            log.warn("Job de IA nao encontrado ao processar id={}", jobId);
            return;
        }
        try {
            AiTask task = AiTask.valueOf(job.getTask());
            AiModel model = router.resolve(task);
            AiRequest request = new AiRequest(
                    task, job.getInputRef(), job.getOrganizationId(), job.getUserId());
            AiResult result = gateway.run(model, request);

            String requestId = UUID.randomUUID().toString();
            ledger.record(job.getOrganizationId(), job.getUserId(), task, result, requestId);

            job.setStatus("COMPLETED");
            job.setResultRef(result.output());
            job.setError(null);
            job.setProcessedAt(OffsetDateTime.now());
            jobs.save(job);
            log.debug("Job de IA concluido id={} task={}", jobId, task);
        } catch (RuntimeException ex) {
            job.setStatus("FAILED");
            job.setError(truncateError(ex.getMessage()));
            job.setAttempts(job.getAttempts() + 1);
            job.setProcessedAt(OffsetDateTime.now());
            jobs.save(job);
            log.warn("Falha ao processar job de IA id={} tentativa={}",
                    jobId, job.getAttempts(), ex);
        }
    }

    private static String truncateError(String message) {
        if (message == null) {
            return "unknown error";
        }
        return message.length() <= MAX_ERROR_LENGTH ? message : message.substring(0, MAX_ERROR_LENGTH);
    }
}
