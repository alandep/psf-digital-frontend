package com.eip.modules.cms.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link AccessProfileEntity}.
 */
public interface AccessProfileJpaRepository extends JpaRepository<AccessProfileEntity, UUID> {

    Optional<AccessProfileEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<AccessProfileEntity> findByOrganizationId(UUID organizationId);

    void deleteByIdAndOrganizationId(UUID id, UUID organizationId);
}
