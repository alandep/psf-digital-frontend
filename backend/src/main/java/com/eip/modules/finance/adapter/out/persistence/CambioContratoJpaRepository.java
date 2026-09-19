package com.eip.modules.finance.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link CambioContratoEntity}.
 */
public interface CambioContratoJpaRepository extends JpaRepository<CambioContratoEntity, UUID> {

    Optional<CambioContratoEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<CambioContratoEntity> findByOrganizationId(UUID organizationId);

    List<CambioContratoEntity> findByOrganizationIdAndStatus(UUID organizationId, String status);
}
