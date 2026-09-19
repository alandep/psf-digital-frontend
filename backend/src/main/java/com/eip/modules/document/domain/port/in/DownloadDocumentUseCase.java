package com.eip.modules.document.domain.port.in;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Inbound port: generate a short-lived signed URL to download a document.
 */
public interface DownloadDocumentUseCase {

    /**
     * Checks ownership then returns a short-lived signed download URL.
     *
     * @param documentId the document to download
     */
    DownloadTicket gerarDownload(UUID documentId);

    /** A signed, expiring URL the client uses to GET the file from storage. */
    record DownloadTicket(String downloadUrl, OffsetDateTime expiresAt) {
    }
}
