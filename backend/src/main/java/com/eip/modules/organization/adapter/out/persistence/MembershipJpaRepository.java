package com.eip.modules.organization.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link MembershipEntity}.
 */
public interface MembershipJpaRepository extends JpaRepository<MembershipEntity, UUID> {

    List<MembershipEntity> findByUserIdAndStatus(UUID userId, String status);

    boolean existsByUserIdAndOrganizationIdAndStatus(UUID userId, UUID organizationId, String status);
}
