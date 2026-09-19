package com.eip.modules.document.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link DocumentEntity}.
 */
public interface DocumentJpaRepository extends JpaRepository<DocumentEntity, UUID> {

    Optional<DocumentEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<DocumentEntity> findByOrganizationId(UUID organizationId);

    List<DocumentEntity> findByOrganizationIdAndDocType(UUID organizationId, String docType);

    List<DocumentEntity> findByOrganizationIdAndExportId(UUID organizationId, UUID exportId);
}
