package com.eip.modules.subscription.domain.port.out;

import java.util.Optional;
import java.util.UUID;

import com.eip.modules.subscription.domain.model.Subscription;

/**
 * Outbound port for subscription persistence.
 */
public interface SubscriptionRepositoryPort {

    /** @return the current (most recent) subscription for the org, if any. */
    Optional<Subscription> currentForOrg(UUID organizationId);

    /**
     * Persists the aggregate. Implementations must translate optimistic-lock
     * failures into {@code ConcurrentModificationConflictException}.
     */
    Subscription save(Subscription subscription);
}
