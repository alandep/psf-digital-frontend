package com.eip.modules.finance.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link PagamentoEntity}.
 */
public interface PagamentoJpaRepository extends JpaRepository<PagamentoEntity, UUID> {

    Optional<PagamentoEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<PagamentoEntity> findByOrganizationId(UUID organizationId);

    List<PagamentoEntity> findByOrganizationIdAndStatus(UUID organizationId, String status);

    List<PagamentoEntity> findByOrganizationIdAndTipoAndStatus(
            UUID organizationId, String tipo, String status);
}
