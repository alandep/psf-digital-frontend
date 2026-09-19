package com.eip.platform.outbox;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository for {@link OutboxEvent}.
 */
public interface OutboxRepository extends JpaRepository<OutboxEvent, UUID> {

    /**
     * Fetches a batch of unprocessed, due events ordered by occurrence, locking
     * the selected rows with {@code FOR UPDATE SKIP LOCKED} so concurrent
     * workers never process the same row.
     *
     * @param limit maximum number of rows to claim
     */
    @Query(value = "select * from outbox_event "
            + "where processed_at is null and available_at <= now() "
            + "order by occurred_at "
            + "limit :limit for update skip locked",
            nativeQuery = true)
    List<OutboxEvent> findBatch(@Param("limit") int limit);
}
