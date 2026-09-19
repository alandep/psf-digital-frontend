package com.eip.modules.document.adapter.in.worker;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.eip.modules.document.adapter.in.worker.DocumentJobProcessor.Claim;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;
import com.eip.platform.tenant.OrganizationId;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Scheduled worker that drains the {@code document_job} queue.
 *
 * <p>Mirrors {@code AiJobWorker}. Because the worker runs on a background thread
 * with no request context and {@code document}/{@code document_job} are
 * RLS-protected, RLS is applied <em>per job</em>: a short transaction claims and
 * marks the batch {@code PROCESSING} ({@link DocumentJobProcessor#claimAndMark(int)}),
 * then for each claim the worker binds the job's organization to
 * {@link OrganizationContextHolder} before calling
 * {@link DocumentJobProcessor#complete(java.util.UUID)} — a separate bean so the
 * AOP proxy applies the RLS aspect for that tenant's transaction — and clears
 * the context afterwards to avoid leaking across pooled threads.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DocumentJobWorker {

    private static final int BATCH_SIZE = 20;

    private final DocumentJobProcessor processor;

    @Scheduled(fixedDelayString = "${eip.document.worker.poll-ms:7000}")
    public void poll() {
        List<Claim> claims = processor.claimAndMark(BATCH_SIZE);
        if (claims.isEmpty()) {
            return;
        }
        log.debug("Processando lote de document_job: {} job(s)", claims.size());
        for (Claim claim : claims) {
            // Bind the job's tenant BEFORE the @Transactional processor call so
            // RlsAspect (running @Before that transaction) applies the correct
            // organization RLS. Clear afterwards to avoid thread-local leakage.
            OrganizationContextHolder.set(OrganizationContext.anonymous(
                    OrganizationId.of(claim.organizationId())));
            try {
                processor.complete(claim.id());
            } catch (RuntimeException ex) {
                log.warn("Erro ao processar document_job id={}", claim.id(), ex);
            } finally {
                OrganizationContextHolder.clear();
            }
        }
    }
}
