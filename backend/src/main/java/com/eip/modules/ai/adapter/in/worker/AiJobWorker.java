package com.eip.modules.ai.adapter.in.worker;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.eip.modules.ai.adapter.in.worker.AiJobProcessor.Claim;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;
import com.eip.platform.tenant.OrganizationId;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Scheduled worker that drains the {@code ai_job} queue.
 *
 * <p>Modelled on the platform {@code OutboxWorker}, but with a crucial
 * difference driven by multi-tenant RLS. The worker runs on a background thread
 * with <strong>no request context</strong>, while {@code ai_job} feeds
 * RLS-protected tenant tables that require {@code app.current_organization} to
 * be bound per transaction (the {@link com.eip.platform.tenant.RlsAspect} binds
 * it {@code @Before} each {@code @Transactional} boundary from
 * {@link OrganizationContextHolder}).
 *
 * <p>Therefore the poll is split so RLS is applied <em>per job</em>:
 * <ol>
 *   <li>{@link AiJobProcessor#claimAndMark(int)} runs in one short transaction
 *       that claims a batch with {@code FOR UPDATE SKIP LOCKED} and flips each to
 *       {@code PROCESSING}, returning lightweight claims.</li>
 *   <li>For each claim, this worker binds the job's organization to the
 *       {@code OrganizationContextHolder} and then calls
 *       {@link AiJobProcessor#complete(java.util.UUID)} — a separate bean so the
 *       AOP proxy applies the RLS aspect for that tenant's transaction — finally
 *       clearing the context to avoid leaking across pooled threads.</li>
 * </ol>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AiJobWorker {

    private static final int BATCH_SIZE = 20;

    private final AiJobProcessor processor;

    @Scheduled(fixedDelayString = "${eip.ai.worker.poll-ms:5000}")
    public void poll() {
        List<Claim> claims = processor.claimAndMark(BATCH_SIZE);
        if (claims.isEmpty()) {
            return;
        }
        log.debug("Processando lote de ai_job: {} job(s)", claims.size());
        for (Claim claim : claims) {
            // Bind the job's tenant BEFORE the @Transactional processor call so
            // RlsAspect (running @Before that transaction) applies the correct
            // organization RLS. Clear afterwards to avoid thread-local leakage.
            OrganizationContextHolder.set(OrganizationContext.anonymous(
                    OrganizationId.of(claim.organizationId())));
            try {
                processor.complete(claim.id());
            } catch (RuntimeException ex) {
                log.warn("Erro ao processar ai_job id={}", claim.id(), ex);
            } finally {
                OrganizationContextHolder.clear();
            }
        }
    }
}
