package com.eip.modules.document.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import com.eip.modules.document.domain.model.Document;
import com.eip.modules.document.domain.port.out.DocumentRepositoryPort;
import com.eip.platform.error.ConcurrentModificationConflictException;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link DocumentRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class DocumentJpaAdapter implements DocumentRepositoryPort {

    private final DocumentJpaRepository jpa;
    private final DocumentMapper mapper;

    @Override
    public Document salvar(Document d) {
        try {
            DocumentEntity existing = jpa
                    .findByIdAndOrganizationId(d.id().value(), d.organizationId())
                    .orElse(null);
            DocumentEntity entity = mapper.toEntity(d, existing);
            DocumentEntity saved = jpa.saveAndFlush(entity);
            return mapper.toDomain(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrentModificationConflictException(
                    "Documento modificado concorrentemente: " + d.id().asString(), ex);
        }
    }

    @Override
    public Optional<Document> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public List<Document> listar(UUID org, String type, UUID exportId) {
        List<DocumentEntity> rows;
        if (exportId != null) {
            rows = jpa.findByOrganizationIdAndExportId(org, exportId);
        } else if (type != null && !type.isBlank()) {
            rows = jpa.findByOrganizationIdAndDocType(org, type);
        } else {
            rows = jpa.findByOrganizationId(org);
        }
        return rows.stream().map(mapper::toDomain).toList();
    }
}
