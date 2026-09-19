package com.eip.modules.ai.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link AiJobEntity}.
 */
public interface AiJobJpaRepository extends JpaRepository<AiJobEntity, UUID> {

    Optional<AiJobEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
