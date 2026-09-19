package com.eip.modules.subscription.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link SubscriptionEntity}.
 */
public interface SubscriptionJpaRepository extends JpaRepository<SubscriptionEntity, UUID> {

    Optional<SubscriptionEntity> findFirstByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
}
