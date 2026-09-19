package com.eip.modules.crm.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link OportunidadeEntity}.
 */
public interface OportunidadeJpaRepository extends JpaRepository<OportunidadeEntity, UUID> {

    Optional<OportunidadeEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<OportunidadeEntity> findByOrganizationId(UUID organizationId);

    List<OportunidadeEntity> findByOrganizationIdAndEstagio(UUID organizationId, String estagio);
}
