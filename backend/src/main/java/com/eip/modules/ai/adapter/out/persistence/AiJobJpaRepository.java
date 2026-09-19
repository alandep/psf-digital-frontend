package com.eip.modules.ai.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for {@link AiJobEntity}.
 */
public interface AiJobJpaRepository extends JpaRepository<AiJobEntity, UUID> {

    Optional<AiJobEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    /**
     * Claims a batch of due, QUEUED jobs ordered by creation, row-locking the
     * selected rows with {@code FOR UPDATE SKIP LOCKED} so concurrent workers
     * never process the same row.
     *
     * @param limit maximum number of rows to claim
     */
    @Query(value = "select * from ai_job "
            + "where status = 'QUEUED' and available_at <= now() "
            + "order by created_at "
            + "limit :limit for update skip locked",
            nativeQuery = true)
    List<AiJobEntity> claimBatch(@Param("limit") int limit);
}
