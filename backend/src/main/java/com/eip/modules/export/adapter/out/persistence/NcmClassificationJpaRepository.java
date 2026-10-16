package com.eip.modules.export.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA repository for {@link NcmClassificationEntity}. RLS scopes rows to the tenant. */
public interface NcmClassificationJpaRepository extends JpaRepository<NcmClassificationEntity, UUID> {

    List<NcmClassificationEntity> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);

    Optional<NcmClassificationEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
