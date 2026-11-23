package com.eip.modules.document.api;

import java.time.OffsetDateTime;
import java.util.OptionalLong;
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

    /**
     * Uploads bytes to object storage server-side and returns the canonical
     * storage URI (ex.: {@code gs://bucket/key}) that providers can read. Unlike
     * {@link #signedUpload}, the backend writes the bytes itself (no client PUT).
     */
    String upload(String storageKey, byte[] content, String mediaType);

    /**
     * Real size in bytes of the stored object, read from the storage metadata.
     *
     * @return the size, or empty when the object does not exist or the store cannot report it
     */
    OptionalLong objectSize(String storageKey);

    /** A signed, expiring URL. */
    record SignedUrl(String url, OffsetDateTime expiresAt) {
    }
}
