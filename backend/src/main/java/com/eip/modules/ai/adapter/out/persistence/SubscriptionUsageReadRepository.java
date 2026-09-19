package com.eip.modules.ai.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Read-only Spring Data repository over the shared {@code subscription_usage}
 * table (see {@link SubscriptionUsageReadEntity} for the decoupling rationale).
 */
public interface SubscriptionUsageReadRepository
        extends JpaRepository<SubscriptionUsageReadEntity, UUID> {

    List<SubscriptionUsageReadEntity> findByOrganizationId(UUID organizationId);
}
