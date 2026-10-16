package com.eip.modules.export.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA repository for {@link CustomerEntity}. RLS scopes rows to the tenant. */
public interface CustomerJpaRepository extends JpaRepository<CustomerEntity, UUID> {

    List<CustomerEntity> findByOrganizationIdOrderByNameAsc(UUID organizationId);

    Optional<CustomerEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
