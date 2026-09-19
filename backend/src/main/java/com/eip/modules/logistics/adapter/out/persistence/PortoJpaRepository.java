package com.eip.modules.logistics.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link PortoEntity}.
 */
public interface PortoJpaRepository extends JpaRepository<PortoEntity, UUID> {

    List<PortoEntity> findByOrganizationId(UUID organizationId);
}
