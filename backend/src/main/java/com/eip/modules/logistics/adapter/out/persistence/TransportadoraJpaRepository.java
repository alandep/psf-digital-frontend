package com.eip.modules.logistics.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link TransportadoraEntity}.
 */
public interface TransportadoraJpaRepository extends JpaRepository<TransportadoraEntity, UUID> {

    List<TransportadoraEntity> findByOrganizationId(UUID organizationId);
}
