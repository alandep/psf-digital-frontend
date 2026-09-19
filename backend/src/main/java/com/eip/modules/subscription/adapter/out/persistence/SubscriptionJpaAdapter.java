package com.eip.modules.subscription.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;

import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.model.Subscription;
import com.eip.modules.subscription.domain.port.out.SubscriptionRepositoryPort;
import com.eip.platform.error.ConcurrentModificationConflictException;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link SubscriptionRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class SubscriptionJpaAdapter implements SubscriptionRepositoryPort {

    private final SubscriptionJpaRepository jpa;
    private final SubscriptionMapper mapper;

    @Override
    public Optional<Subscription> currentForOrg(UUID organizationId) {
        return jpa.findFirstByOrganizationIdOrderByCreatedAtDesc(organizationId)
                .map(mapper::toDomain);
    }

    @Override
    public Subscription save(Subscription subscription) {
        try {
            SubscriptionEntity existing = jpa.findById(subscription.id().value()).orElse(null);
            SubscriptionEntity entity = mapper.toEntity(subscription, existing);
            SubscriptionEntity saved = jpa.saveAndFlush(entity);
            return mapper.toDomain(saved);
        } catch (ObjectOptimisticLockingFailureException ex) {
            throw new ConcurrentModificationConflictException(
                    "Assinatura modificada concorrentemente: " + subscription.id().asString(), ex);
        }
    }
}
