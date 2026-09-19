package com.eip.modules.crm.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link ClienteEntity}.
 */
public interface ClienteJpaRepository extends JpaRepository<ClienteEntity, UUID> {

    Optional<ClienteEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<ClienteEntity> findByOrganizationId(UUID organizationId);

    List<ClienteEntity> findByOrganizationIdAndStatus(UUID organizationId, String status);
}
