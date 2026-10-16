package com.eip.modules.admin.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Admin repository for {@link AdminSubscriptionEntity} (RLS-scoped at runtime). */
public interface AdminSubscriptionJpaRepository extends JpaRepository<AdminSubscriptionEntity, UUID> {

    Optional<AdminSubscriptionEntity> findFirstByOrganizationId(UUID organizationId);
}