package com.eip.modules.bi.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link SavedQueryEntity}.
 */
public interface SavedQueryJpaRepository extends JpaRepository<SavedQueryEntity, UUID> {

    Optional<SavedQueryEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<SavedQueryEntity> findByOrganizationId(UUID organizationId);
}
