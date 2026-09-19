package com.eip.modules.ai.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link AiModelConfigEntity}.
 */
public interface AiModelConfigJpaRepository extends JpaRepository<AiModelConfigEntity, UUID> {

    List<AiModelConfigEntity> findByEnabledTrue();

    Optional<AiModelConfigEntity> findByTaskAndPriority(String task, String priority);

    List<AiModelConfigEntity> findByTaskAndEnabledTrue(String task);
}
