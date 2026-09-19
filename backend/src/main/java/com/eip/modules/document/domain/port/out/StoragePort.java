package com.eip.modules.document.domain.port.out;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Outbound port for object storage. Files are uploaded and downloaded directly
 * by the client via short-lived signed URLs; the backend only mints them.
 */
public interface StoragePort {

    /** Mints a signed URL for a direct-to-storage PUT of {@code storageKey}. */
    SignedUrl signedUpload(String storageKey, String mediaType);

    /** Mints a signed URL for a direct-from-storage GET of {@code storageKey}. */
    SignedUrl signedDownload(String storageKey);

    /** Builds the canonical storage key for a document's file. */
    String buildKey(UUID org, UUID documentId, String filename);

    /** A signed, expiring URL. */
    record SignedUrl(String url, OffsetDateTime expiresAt) {
    }
}
