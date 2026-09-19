package com.eip.modules.document.adapter.in.worker;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.document.adapter.out.persistence.DocumentEntity;
import com.eip.modules.document.adapter.out.persistence.DocumentJobEntity;
import com.eip.modules.document.adapter.out.persistence.DocumentJobJpaRepository;
import com.eip.modules.document.adapter.out.persistence.DocumentJpaRepository;
import com.eip.modules.document.domain.model.ScanStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Processes a single {@code document_job} inside its own transaction.
 *
 * <p><strong>RLS-per-job rationale:</strong> the worker runs on a background
 * thread with no request context. The {@code document} / {@code document_job}
 * tables are RLS-protected and require {@code app.current_organization} bound
 * per transaction. The {@link com.eip.platform.tenant.RlsAspect} binds that
 * value {@code @Before} each {@code @Transactional} unit of work from
 * {@link com.eip.platform.tenant.OrganizationContextHolder}. The caller
 * ({@code DocumentJobWorker}) sets the holder to the job's organization
 * <em>before</em> invoking {@link #complete(UUID)}. This is a separate
 * {@code @Component} so the Spring AOP proxy applies the aspect on the call.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DocumentJobProcessor {

    private static final int MAX_ERROR_LENGTH = 1000;
    private static final String JOB_TYPE_OCR = "OCR";

    private final DocumentJobJpaRepository jobs;
    private final DocumentJpaRepository documents;

    /** A claimed job reduced to what the processing loop needs. */
    public record Claim(UUID id, UUID organizationId) {
    }

    /**
     * Claims a batch of due QUEUED jobs and marks them {@code PROCESSING} in a
     * single short transaction. Lives on this bean (not the worker) so the
     * {@code @Transactional} proxy applies.
     */
    @Transactional
    public List<Claim> claimAndMark(int batchSize) {
        List<DocumentJobEntity> batch = jobs.claimBatch(batchSize);
        List<Claim> claims = new ArrayList<>(batch.size());
        for (DocumentJobEntity job : batch) {
            job.setStatus("PROCESSING");
            jobs.save(job);
            claims.add(new Claim(job.getId(), job.getOrganizationId()));
        }
        return claims;
    }

    /**
     * Completes the job identified by {@code jobId}. The caller must have bound
     * the job's organization to {@code OrganizationContextHolder} before calling
     * so RLS is applied for the correct tenant.
     */
    @Transactional
    public void complete(UUID jobId) {
        DocumentJobEntity job = jobs.findById(jobId).orElse(null);
        if (job == null) {
            log.warn("Document job nao encontrado ao processar id={}", jobId);
            return;
        }
        try {
            if (JOB_TYPE_OCR.equalsIgnoreCase(job.getJobType()) && job.getDocumentId() != null) {
                // Mock OCR/scan: mark the associated document as scanned CLEAN.
                DocumentEntity document = documents
                        .findByIdAndOrganizationId(job.getDocumentId(), job.getOrganizationId())
                        .orElse(null);
                if (document != null) {
                    document.setScanStatus(ScanStatus.CLEAN.name());
                    documents.save(document);
                }
            }
            job.setStatus("COMPLETED");
            job.setResultRef("ocr-ok");
            job.setError(null);
            job.setProcessedAt(OffsetDateTime.now());
            jobs.save(job);
            log.debug("Document job concluido id={} type={}", jobId, job.getJobType());
        } catch (RuntimeException ex) {
            job.setStatus("FAILED");
            job.setError(truncateError(ex.getMessage()));
            job.setAttempts(job.getAttempts() + 1);
            job.setProcessedAt(OffsetDateTime.now());
            jobs.save(job);
            log.warn("Falha ao processar document job id={} tentativa={}",
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
