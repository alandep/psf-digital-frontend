package com.eip.modules.compliance.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link CertificacaoEntity}.
 */
public interface CertificacaoJpaRepository extends JpaRepository<CertificacaoEntity, UUID> {

    List<CertificacaoEntity> findByOrganizationId(UUID organizationId);

    List<CertificacaoEntity> findByOrganizationIdAndStatus(UUID organizationId, String status);

    Optional<CertificacaoEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    void deleteByIdAndOrganizationId(UUID id, UUID organizationId);
}
