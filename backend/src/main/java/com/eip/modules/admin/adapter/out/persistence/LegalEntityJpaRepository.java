package com.eip.modules.admin.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA repository for {@link LegalEntityEntity}. Identity table (not RLS-scoped). */
public interface LegalEntityJpaRepository extends JpaRepository<LegalEntityEntity, UUID> {

    List<LegalEntityEntity> findByOrganizationId(UUID organizationId);

    Optional<LegalEntityEntity> findFirstByOrganizationId(UUID organizationId);
}