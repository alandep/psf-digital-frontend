package com.eip.modules.export.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA repository for {@link ProductEntity}. RLS scopes rows to the tenant. */
public interface ProductJpaRepository extends JpaRepository<ProductEntity, UUID> {

    List<ProductEntity> findByOrganizationIdOrderByNameAsc(UUID organizationId);

    Optional<ProductEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);
}
