package com.eip.modules.document.domain.port.out;

import java.util.UUID;

/**
 * Outbound port for enqueuing async document processing jobs (OCR, analysis,
 * report generation, ...). Backed by the {@code document_job} table.
 */
public interface DocumentJobPort {

    /**
     * Enqueues a new {@code QUEUED} job for a document.
     *
     * @param jobType one of OCR/ANALYSIS/EXPORT_ZIP/REPORT
     */
    void enqueue(UUID org, UUID documentId, String jobType);
}
