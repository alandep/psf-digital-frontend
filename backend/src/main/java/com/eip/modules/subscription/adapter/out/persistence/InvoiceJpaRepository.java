package com.eip.modules.subscription.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link InvoiceEntity}.
 */
public interface InvoiceJpaRepository extends JpaRepository<InvoiceEntity, UUID> {

    List<InvoiceEntity> findByOrganizationIdOrderByIssuedAtDesc(UUID organizationId);
}
