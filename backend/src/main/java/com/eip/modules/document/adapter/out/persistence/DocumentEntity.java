package com.eip.modules.document.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JPA entity mapping for the {@code document} table.
 */
@Entity
@Table(name = "document")
@Getter
@Setter
@NoArgsConstructor
public class DocumentEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "legal_entity_id")
    private UUID legalEntityId;

    @Column(name = "export_id")
    private UUID exportId;

    @Column(name = "doc_type", nullable = false)
    private String docType;

    private String title;

    @Column(name = "storage_key")
    private String storageKey;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "media_type")
    private String mediaType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    private String sha256;

    private String classification;

    @Column(name = "upload_status", nullable = false)
    private String uploadStatus;

    @Column(name = "scan_status", nullable = false)
    private String scanStatus;

    @Version
    private long version;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
