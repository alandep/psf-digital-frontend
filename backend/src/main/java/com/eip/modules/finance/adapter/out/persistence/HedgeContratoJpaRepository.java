package com.eip.modules.finance.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link HedgeContratoEntity}.
 */
public interface HedgeContratoJpaRepository extends JpaRepository<HedgeContratoEntity, UUID> {

    Optional<HedgeContratoEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<HedgeContratoEntity> findByOrganizationId(UUID organizationId);

    List<HedgeContratoEntity> findByOrganizationIdAndStatus(UUID organizationId, String status);
}
