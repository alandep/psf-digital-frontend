package com.eip.modules.document.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Document aggregate root. Holds metadata about a file stored in object
 * storage. Pure domain: no framework annotations, invariants enforced in code.
 *
 * <p>A document is first created in {@link UploadStatus#PENDING} (metadata only,
 * before the physical file exists) via {@link #nova}, then transitions to
 * {@link UploadStatus#UPLOADED} once the client confirms the upload.
 */
public final class Document {

    private final DocumentId id;
    private final UUID organizationId;
    private final UUID legalEntityId;
    private final UUID exportId;
    private final DocumentType type;
    private final String title;
    private final String storageKey;
    private final String originalFilename;
    private final String mediaType;
    private Long sizeBytes;
    private String sha256;
    private final String classification;
    private UploadStatus uploadStatus;
    private ScanStatus scanStatus;
    private final long version;
    /** Audit timestamp; {@code null} for a not-yet-persisted aggregate, populated on load from persistence. */
    private final OffsetDateTime createdAt;

    public Document(DocumentId id, UUID organizationId, UUID legalEntityId, UUID exportId,
                    DocumentType type, String title, String storageKey, String originalFilename,
                    String mediaType, Long sizeBytes, String sha256, String classification,
                    UploadStatus uploadStatus, ScanStatus scanStatus, long version,
                    OffsetDateTime createdAt) {
        if (id == null) {
            throw new IllegalArgumentException("id must not be null");
        }
        if (organizationId == null) {
            throw new IllegalArgumentException("organizationId must not be null");
        }
        if (type == null) {
            throw new IllegalArgumentException("type must not be null");
        }
        this.id = id;
        this.organizationId = organizationId;
        this.legalEntityId = legalEntityId;
        this.exportId = exportId;
        this.type = type;
        this.title = title;
        this.storageKey = storageKey;
        this.originalFilename = originalFilename;
        this.mediaType = mediaType;
        this.sizeBytes = sizeBytes;
        this.sha256 = sha256;
        this.classification = classification;
        this.uploadStatus = uploadStatus == null ? UploadStatus.PENDING : uploadStatus;
        this.scanStatus = scanStatus == null ? ScanStatus.PENDING : scanStatus;
        this.version = version;
        this.createdAt = createdAt;
    }

    /**
     * Creates a new {@code PENDING} metadata record before the file is uploaded.
     * The storage key is pre-computed so the client can PUT directly to storage.
     */
    public static Document nova(UUID organizationId, UUID legalEntityId, UUID exportId,
                                DocumentType type, String title, String storageKey,
                                String originalFilename, String mediaType, String classification) {
        return new Document(
                DocumentId.novo(),
                organizationId,
                legalEntityId,
                exportId,
                type,
                title,
                storageKey,
                originalFilename,
                mediaType,
                null,
                null,
                classification,
                UploadStatus.PENDING,
                ScanStatus.PENDING,
                0L,
                null);
    }

    /** Marks the file as successfully uploaded, recording its size and checksum. */
    public void markUploaded(Long sizeBytes, String sha256) {
        this.sizeBytes = sizeBytes;
        this.sha256 = sha256;
        this.uploadStatus = UploadStatus.UPLOADED;
    }

    /** Marks the upload as failed. */
    public void markFailed() {
        this.uploadStatus = UploadStatus.FAILED;
    }

    public DocumentId id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public UUID legalEntityId() {
        return legalEntityId;
    }

    public UUID exportId() {
        return exportId;
    }

    public DocumentType type() {
        return type;
    }

    public String title() {
        return title;
    }

    public String storageKey() {
        return storageKey;
    }

    public String originalFilename() {
        return originalFilename;
    }

    public String mediaType() {
        return mediaType;
    }

    public Long sizeBytes() {
        return sizeBytes;
    }

    public String sha256() {
        return sha256;
    }

    public String classification() {
        return classification;
    }

    public UploadStatus uploadStatus() {
        return uploadStatus;
    }

    public ScanStatus scanStatus() {
        return scanStatus;
    }

    public long version() {
        return version;
    }

    /** Audit field populated on load from persistence; {@code null} for a new aggregate. */
    public OffsetDateTime createdAt() {
        return createdAt;
    }
}
