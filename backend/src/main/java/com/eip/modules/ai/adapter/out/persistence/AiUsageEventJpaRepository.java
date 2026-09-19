package com.eip.modules.ai.adapter.out.persistence;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link AiUsageEventEntity}.
 */
public interface AiUsageEventJpaRepository extends JpaRepository<AiUsageEventEntity, UUID> {
}
