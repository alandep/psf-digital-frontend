package com.eip.platform.idempotency;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data repository for {@link IdempotencyRecord}.
 */
public interface IdempotencyRepository extends JpaRepository<IdempotencyRecord, UUID> {

    Optional<IdempotencyRecord> findByOrganizationIdAndOperationAndIdemKey(
            UUID organizationId, String operation, String idemKey);
}
