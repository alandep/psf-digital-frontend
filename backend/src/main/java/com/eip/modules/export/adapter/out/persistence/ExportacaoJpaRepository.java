package com.eip.modules.export.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link ExportacaoEntity}.
 */
public interface ExportacaoJpaRepository extends JpaRepository<ExportacaoEntity, UUID> {

    Optional<ExportacaoEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    Page<ExportacaoEntity> findByOrganizationId(UUID organizationId, Pageable pageable);

    Page<ExportacaoEntity> findByOrganizationIdAndStatus(
            UUID organizationId, String status, Pageable pageable);
}
