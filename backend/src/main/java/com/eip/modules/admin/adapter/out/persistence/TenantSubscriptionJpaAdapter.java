package com.eip.modules.admin.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.admin.domain.port.out.TenantSubscriptionPort;

import lombok.RequiredArgsConstructor;

/**
 * JPA implementation of {@link TenantSubscriptionPort}. RLS applies: the caller
 * binds the target organization before invoking it.
 */
@Component
@RequiredArgsConstructor
public class TenantSubscriptionJpaAdapter implements TenantSubscriptionPort {

    private final AdminSubscriptionJpaRepository subRepo;
    private final AdminPlanFeatureJpaRepository planFeatureRepo;
    private final AdminOrgEntitlementJpaRepository orgEntitlementRepo;

    @Override
    public void createSubscription(InitialSubscription s) {
        OffsetDateTime now = OffsetDateTime.now();
        AdminSubscriptionEntity sub = new AdminSubscriptionEntity();
        sub.setId(UUID.randomUUID());
        sub.setOrganizationId(s.organizationId());
        sub.setPlanCode(s.planCode());
        sub.setPlanName(s.planName());
        sub.setBillingInterval(s.billingInterval());
        sub.setAmount(s.amount());
        sub.setStatus(s.status());
        sub.setCurrentPeriodStart(s.periodStart());
        sub.setCurrentPeriodEnd(s.periodEnd());
        sub.setTrialEnd(s.trialEnd());
        sub.setCancelAtPeriodEnd(false);
        sub.setCreatedAt(now);
        sub.setUpdatedAt(now);
        subRepo.save(sub);
    }

    @Override
    public void applyPlanEntitlements(UUID organizationId, String planCode, OffsetDateTime now) {
        List<AdminPlanFeatureEntity> features = planFeatureRepo.findByPlanCode(planCode);
        for (AdminPlanFeatureEntity f : features) {
            AdminOrgEntitlementEntity e = new AdminOrgEntitlementEntity();
            e.setOrganizationId(organizationId);
            e.setFeatureKey(f.getFeatureKey());
            e.setEnabled(f.isEnabled());
            e.setLimitValue(f.getLimitValue());
            e.setAppliedPlan(planCode);
            e.setUpdatedAt(now);
            orgEntitlementRepo.save(e);
        }
    }
}
