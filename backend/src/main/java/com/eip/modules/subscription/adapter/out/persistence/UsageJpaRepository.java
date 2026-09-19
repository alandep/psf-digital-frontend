package com.eip.modules.subscription.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link UsageEntity}.
 */
public interface UsageJpaRepository extends JpaRepository<UsageEntity, UUID> {

    List<UsageEntity> findByOrganizationId(UUID organizationId);
}
