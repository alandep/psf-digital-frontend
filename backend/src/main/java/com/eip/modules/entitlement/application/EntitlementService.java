package com.eip.modules.entitlement.application;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.entitlement.adapter.out.persistence.OrganizationEntitlementEntity;
import com.eip.modules.entitlement.adapter.out.persistence.OrganizationEntitlementJpaRepository;
import com.eip.modules.entitlement.adapter.out.persistence.PlanFeatureEntity;
import com.eip.modules.entitlement.adapter.out.persistence.PlanFeatureJpaRepository;
import com.eip.modules.entitlement.domain.port.in.AplicarEntitlementsUseCase;
import com.eip.modules.entitlement.domain.port.in.ConsultarEntitlementsUseCase;

import lombok.RequiredArgsConstructor;

/**
 * Applies and reads plan-based entitlements. {@link #aplicarPlano} snapshots the
 * global {@code plan_feature} matrix into the tenant-scoped
 * {@code organization_entitlement} table (upsert). Reads are tenant-scoped by
 * RLS; the caller must run within the target org's context.
 */
@Service
@RequiredArgsConstructor
public class EntitlementService implements AplicarEntitlementsUseCase, ConsultarEntitlementsUseCase {

    private final PlanFeatureJpaRepository planFeatureRepo;
    private final OrganizationEntitlementJpaRepository orgEntitlementRepo;

    @Override
    @Transactional
    public int aplicarPlano(UUID organizationId, String planCode) {
        if (organizationId == null || planCode == null || planCode.isBlank()) {
            return 0;
        }
        List<PlanFeatureEntity> features = planFeatureRepo.findByPlanCode(planCode.trim().toUpperCase());
        OffsetDateTime now = OffsetDateTime.now();
        int applied = 0;
        for (PlanFeatureEntity f : features) {
            OrganizationEntitlementEntity e = new OrganizationEntitlementEntity();
            e.setOrganizationId(organizationId);
            e.setFeatureKey(f.getFeatureKey());
            e.setEnabled(f.isEnabled());
            e.setLimitValue(f.getLimitValue());
            e.setAppliedPlan(planCode.trim().toUpperCase());
            e.setUpdatedAt(now);
            orgEntitlementRepo.save(e); // upsert by composite PK
            applied++;
        }
        return applied;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EntitlementView> listar(UUID organizationId) {
        if (organizationId == null) {
            return List.of();
        }
        return orgEntitlementRepo.findByOrganizationId(organizationId).stream()
                .map(e -> new EntitlementView(
                        e.getFeatureKey(), e.isEnabled(), e.getLimitValue(), e.getAppliedPlan()))
                .toList();
    }
}