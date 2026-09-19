package com.eip.modules.subscription.adapter.out.persistence;

import java.time.OffsetDateTime;

import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.model.BillingInterval;
import com.eip.modules.subscription.domain.model.PlanCode;
import com.eip.modules.subscription.domain.model.Subscription;
import com.eip.modules.subscription.domain.model.SubscriptionId;
import com.eip.modules.subscription.domain.model.SubscriptionStatus;

/**
 * Hand-written mapper between the subscription domain aggregate and its JPA
 * entity.
 */
@Component
public class SubscriptionMapper {

    /**
     * @param existing entity fetched from the store, or {@code null} for insert
     */
    public SubscriptionEntity toEntity(Subscription domain, SubscriptionEntity existing) {
        SubscriptionEntity entity = existing != null ? existing : new SubscriptionEntity();
        if (existing == null) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setVersion(domain.version());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setPlanCode(domain.planCode().name());
        entity.setPlanName(domain.planName());
        entity.setBillingInterval(domain.billingInterval() != null
                ? domain.billingInterval().name() : BillingInterval.MONTHLY.name());
        entity.setAmount(domain.amount());
        entity.setStatus(domain.status().name());
        entity.setCurrentPeriodStart(domain.currentPeriodStart());
        entity.setCurrentPeriodEnd(domain.currentPeriodEnd());
        entity.setTrialEnd(domain.trialEnd());
        entity.setCancelAtPeriodEnd(domain.cancelAtPeriodEnd());
        entity.setPaymentBrand(domain.paymentBrand());
        entity.setPaymentLast4(domain.paymentLast4());
        entity.setUpdatedAt(OffsetDateTime.now());
        return entity;
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public Subscription toDomain(SubscriptionEntity e) {
        return new Subscription(
                SubscriptionId.of(e.getId()),
                e.getOrganizationId(),
                PlanCode.valueOf(e.getPlanCode()),
                e.getPlanName(),
                e.getBillingInterval() != null
                        ? BillingInterval.valueOf(e.getBillingInterval()) : BillingInterval.MONTHLY,
                e.getAmount(),
                SubscriptionStatus.valueOf(e.getStatus()),
                e.getCurrentPeriodStart(),
                e.getCurrentPeriodEnd(),
                e.getTrialEnd(),
                e.isCancelAtPeriodEnd(),
                e.getPaymentBrand(),
                e.getPaymentLast4(),
                e.getVersion());
    }
}
