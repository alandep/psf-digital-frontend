package com.eip.modules.admin.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Admin repository for {@link AdminMembershipEntity}. */
public interface AdminMembershipJpaRepository extends JpaRepository<AdminMembershipEntity, UUID> {

    List<AdminMembershipEntity> findByOrganizationId(UUID organizationId);

    Optional<AdminMembershipEntity> findByOrganizationIdAndUserId(UUID organizationId, UUID userId);
}