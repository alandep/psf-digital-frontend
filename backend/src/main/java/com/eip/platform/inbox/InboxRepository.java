package com.eip.platform.inbox;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for {@link InboxEvent}.
 */
public interface InboxRepository extends JpaRepository<InboxEvent, UUID> {

    boolean existsBySourceAndExternalEventId(String source, String externalEventId);

    Optional<InboxEvent> findBySourceAndExternalEventId(String source, String externalEventId);
}
