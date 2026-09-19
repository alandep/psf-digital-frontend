package com.eip.modules.document.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.document.domain.model.Document;
import com.eip.modules.document.domain.model.DocumentId;
import com.eip.modules.document.domain.model.DocumentType;
import com.eip.modules.document.domain.model.ScanStatus;
import com.eip.modules.document.domain.model.UploadStatus;

/**
 * Hand-written mapper between the {@link Document} aggregate and its JPA entity.
 */
@Component
public class DocumentMapper {

    /**
     * Maps a domain aggregate onto a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for insert
     */
    public DocumentEntity toEntity(Document domain, DocumentEntity existing) {
        DocumentEntity entity = existing != null ? existing : new DocumentEntity();
        boolean isNew = existing == null;
        if (isNew) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setVersion(domain.version());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setLegalEntityId(domain.legalEntityId());
        entity.setExportId(domain.exportId());
        entity.setDocType(domain.type().name());
        entity.setTitle(domain.title());
        entity.setStorageKey(domain.storageKey());
        entity.setOriginalFilename(domain.originalFilename());
        entity.setMediaType(domain.mediaType());
        entity.setSizeBytes(domain.sizeBytes());
        entity.setSha256(domain.sha256());
        entity.setClassification(domain.classification());
        entity.setUploadStatus(domain.uploadStatus().name());
        entity.setScanStatus(domain.scanStatus().name());
        entity.setUpdatedAt(OffsetDateTime.now());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public Document toDomain(DocumentEntity e) {
        return new Document(
                DocumentId.of(e.getId()),
                e.getOrganizationId(),
                e.getLegalEntityId(),
                e.getExportId(),
                DocumentType.valueOf(e.getDocType()),
                e.getTitle(),
                e.getStorageKey(),
                e.getOriginalFilename(),
                e.getMediaType(),
                e.getSizeBytes(),
                e.getSha256(),
                e.getClassification(),
                UploadStatus.valueOf(e.getUploadStatus()),
                ScanStatus.valueOf(e.getScanStatus()),
                e.getVersion(),
                e.getCreatedAt());
    }
}
