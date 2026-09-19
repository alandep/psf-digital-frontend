package com.eip.modules.document.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.document.domain.port.out.DocumentJobPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link DocumentJobPort} by inserting a
 * {@code QUEUED} row into {@code document_job}.
 *
 * <p>TODO: a scheduled worker (mirroring {@code OutboxWorker}) will poll
 * {@code document_job} for {@code QUEUED} rows past {@code available_at} using
 * {@code SELECT ... FOR UPDATE SKIP LOCKED}, run OCR/analysis, and transition
 * the row to {@code COMPLETED}/{@code FAILED}. Out of scope for this slice.
 */
@Component
@RequiredArgsConstructor
public class DocumentJobAdapter implements DocumentJobPort {

    private final DocumentJobJpaRepository jpa;

    @Override
    public void enqueue(UUID org, UUID documentId, String jobType) {
        OffsetDateTime now = OffsetDateTime.now();
        DocumentJobEntity job = new DocumentJobEntity();
        job.setId(UUID.randomUUID());
        job.setOrganizationId(org);
        job.setDocumentId(documentId);
        job.setJobType(jobType);
        job.setStatus("QUEUED");
        job.setAttempts(0);
        job.setCreatedAt(now);
        job.setAvailableAt(now);
        jpa.save(job);
    }
}
