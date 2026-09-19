package com.eip.modules.document.domain.port.in;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.eip.modules.document.domain.port.in.ManageDocumentsUseCase.DocumentView;

/**
 * Inbound port: two-phase async upload of a document via a signed URL.
 *
 * <p>Phase 1 ({@link #iniciarUpload}) reserves metadata and returns a signed
 * URL the client PUTs the file to. Phase 2 ({@link #confirmarUpload}) is called
 * after the PUT succeeds and transitions the document to {@code UPLOADED},
 * enqueuing downstream processing (OCR/analysis).
 */
public interface UploadDocumentUseCase {

    /** Starts an upload: reserves metadata and returns a signed upload ticket. */
    UploadTicket iniciarUpload(IniciarUploadCommand cmd);

    /** Confirms a completed upload, marking the document {@code UPLOADED}. */
    DocumentView confirmarUpload(UUID documentId, Long sizeBytes, String sha256);

    /** Command to start an upload. */
    record IniciarUploadCommand(
            String type,
            String title,
            String originalFilename,
            String mediaType,
            UUID exportId,
            UUID legalEntityId) {
    }

    /** The signed upload URL for a direct-to-storage PUT. */
    record UploadTicket(
            UUID documentId,
            String uploadUrl,
            String storageKey,
            OffsetDateTime expiresAt) {
    }
}
