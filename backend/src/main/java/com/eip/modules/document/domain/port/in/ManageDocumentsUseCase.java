package com.eip.modules.document.domain.port.in;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Inbound port: query documents for the document management screens.
 */
public interface ManageDocumentsUseCase {

    /**
     * Lists documents for the current tenant, optionally filtered.
     *
     * @param type     document type name filter, or {@code null} for all types
     * @param exportId export id filter, or {@code null} for all exports
     */
    List<DocumentView> listar(String type, UUID exportId);

    /** Returns a single document by id (tenant-scoped). */
    DocumentView porId(UUID id);

    /** Read model for document list and detail views. */
    record DocumentView(
            UUID id,
            String type,
            String title,
            String originalFilename,
            String mediaType,
            Long sizeBytes,
            String uploadStatus,
            String scanStatus,
            OffsetDateTime createdAt) {
    }
}
