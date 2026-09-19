package com.eip.modules.intelligence.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link WatchlistItemEntity}.
 */
public interface WatchlistItemJpaRepository extends JpaRepository<WatchlistItemEntity, UUID> {

    Optional<WatchlistItemEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<WatchlistItemEntity> findByOrganizationId(UUID organizationId);

    void deleteByIdAndOrganizationId(UUID id, UUID organizationId);
}
