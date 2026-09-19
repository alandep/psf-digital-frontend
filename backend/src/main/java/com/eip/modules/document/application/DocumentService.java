package com.eip.modules.document.application;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.document.domain.model.Document;
import com.eip.modules.document.domain.model.DocumentType;
import com.eip.modules.document.domain.port.in.DownloadDocumentUseCase;
import com.eip.modules.document.domain.port.in.ManageDocumentsUseCase;
import com.eip.modules.document.domain.port.in.UploadDocumentUseCase;
import com.eip.modules.document.domain.port.out.DocumentJobPort;
import com.eip.modules.document.domain.port.out.DocumentRepositoryPort;
import com.eip.modules.document.domain.port.out.StoragePort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the document use cases: querying, two-phase
 * async upload via signed URLs, and signed downloads. Tenant-scoped and
 * emitting domain events through the transactional outbox.
 */
@Service
@RequiredArgsConstructor
public class DocumentService
        implements ManageDocumentsUseCase, UploadDocumentUseCase, DownloadDocumentUseCase {

    private final DocumentRepositoryPort repo;
    private final StoragePort storage;
    private final DocumentJobPort jobPort;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    private static DocumentView toView(Document d) {
        return new DocumentView(
                d.id().value(),
                d.type().name(),
                d.title(),
                d.originalFilename(),
                d.mediaType(),
                d.sizeBytes(),
                d.uploadStatus().name(),
                d.scanStatus().name(),
                d.createdAt());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentView> listar(String type, UUID exportId) {
        UUID org = currentOrg();
        return repo.listar(org, normalize(type), exportId).stream()
                .map(DocumentService::toView)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentView porId(UUID id) {
        UUID org = currentOrg();
        Document doc = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Documento nao encontrado: " + id));
        return toView(doc);
    }

    @Override
    @Transactional
    public UploadTicket iniciarUpload(IniciarUploadCommand cmd) {
        UUID org = currentOrg();
        UUID documentId = UUID.randomUUID();
        String storageKey = storage.buildKey(org, documentId, cmd.originalFilename());
        Document doc = Document.nova(
                org,
                cmd.legalEntityId(),
                cmd.exportId(),
                DocumentType.valueOf(cmd.type()),
                cmd.title(),
                storageKey,
                cmd.originalFilename(),
                cmd.mediaType(),
                null);
        Document salvo = repo.salvar(doc);
        StoragePort.SignedUrl signed = storage.signedUpload(storageKey, cmd.mediaType());
        return new UploadTicket(
                salvo.id().value(), signed.url(), storageKey, signed.expiresAt());
    }

    @Override
    @Transactional
    public DocumentView confirmarUpload(UUID documentId, Long sizeBytes, String sha256) {
        UUID org = currentOrg();
        Document doc = repo.porId(documentId, org)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Documento nao encontrado: " + documentId));
        doc.markUploaded(sizeBytes, sha256);
        Document salvo = repo.salvar(doc);
        jobPort.enqueue(org, salvo.id().value(), "OCR");
        outbox.record("Document", salvo.id().asString(), org, "DocumentoEnviado",
                payload(salvo.id().value(), org));
        return toView(salvo);
    }

    @Override
    @Transactional(readOnly = true)
    public DownloadTicket gerarDownload(UUID documentId) {
        UUID org = currentOrg();
        Document doc = repo.porId(documentId, org)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Documento nao encontrado: " + documentId));
        StoragePort.SignedUrl signed = storage.signedDownload(doc.storageKey());
        return new DownloadTicket(signed.url(), signed.expiresAt());
    }

    private static String normalize(String type) {
        return (type == null || type.isBlank()) ? null : type;
    }

    private static String payload(UUID documentId, UUID org) {
        return "{\"documentId\":\"" + documentId + "\",\"organizationId\":\"" + org
                + "\",\"occurredAt\":\"" + OffsetDateTime.now() + "\"}";
    }
}
