package com.eip.modules.compliance.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link EsgAvaliacaoEntity}.
 */
public interface EsgJpaRepository extends JpaRepository<EsgAvaliacaoEntity, UUID> {

    List<EsgAvaliacaoEntity> findByOrganizationId(UUID organizationId);
}
