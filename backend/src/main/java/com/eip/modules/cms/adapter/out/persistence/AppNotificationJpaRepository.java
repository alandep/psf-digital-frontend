package com.eip.modules.cms.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for {@link AppNotificationEntity}.
 */
public interface AppNotificationJpaRepository extends JpaRepository<AppNotificationEntity, UUID> {

    List<AppNotificationEntity> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);

    Optional<AppNotificationEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    long countByOrganizationIdAndReadFalse(UUID organizationId);

    @Modifying
    @Query("update AppNotificationEntity n set n.read = true "
            + "where n.organizationId = :org and n.read = false")
    void markAllRead(@Param("org") UUID organizationId);
}
