package com.eip.modules.admin.application;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.admin.adapter.out.persistence.AdminSubscriptionEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminSubscriptionJpaRepository;
import com.eip.modules.admin.domain.port.in.ConsultarOnboardingUseCase;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

/**
 * Computes the trial state and onboarding checklist for the CURRENT org in
 * real time. Counts are native queries against the tenant-scoped business
 * tables; RLS restricts them to the active org, so no explicit org filter is
 * needed (and cross-tenant leakage is impossible). Everything runs inside a
 * single @Transactional so the RlsAspect binds the org GUC.
 */
@Service
@RequiredArgsConstructor
public class OnboardingService implements ConsultarOnboardingUseCase {

    private final EntityManager em;
    private final AdminSubscriptionJpaRepository subRepo;

    @Override
    @Transactional(readOnly = true)
    public TrialState trial() {
        UUID org = currentOrg();
        if (org == null) {
            return new TrialState(false, 0, null);
        }
        AdminSubscriptionEntity sub = subRepo.findFirstByOrganizationId(org).orElse(null);
        if (sub == null) {
            return new TrialState(false, 0, null);
        }
        boolean trialing = "TRIALING".equalsIgnoreCase(sub.getStatus());
        OffsetDateTime end = sub.getCurrentPeriodEnd();
        long days = 0;
        if (end != null) {
            days = Math.max(0, ChronoUnit.DAYS.between(OffsetDateTime.now(), end));
        }
        return new TrialState(trialing, days, sub.getPlanName());
    }

    @Override
    @Transactional(readOnly = true)
    public OnboardingProgress progress() {
        UUID org = currentOrg();

        boolean company = org != null; // org + legal_entity exist once signed up
        boolean product = count("product") > 0;
        boolean customer = count("customer") > 0;
        // "Usuarios convidados": more than the single owner membership.
        boolean users = count("organization_membership") > 1;
        boolean firstExport = count("export") > 0;

        List<OnboardingStep> steps = new ArrayList<>();
        steps.add(new OnboardingStep("company", "Dados da empresa", company));
        steps.add(new OnboardingStep("product", "Produto cadastrado", product));
        steps.add(new OnboardingStep("customer", "Cliente cadastrado", customer));
        steps.add(new OnboardingStep("users", "Usuarios convidados", users));
        steps.add(new OnboardingStep("first_export", "Primeira exportacao", firstExport));

        long done = steps.stream().filter(OnboardingStep::done).count();
        int percent = (int) Math.round((done * 100.0) / steps.size());
        return new OnboardingProgress(percent, steps, percent == 100);
    }

    /** Native count on a tenant-scoped table; RLS limits rows to the active org. */
    private long count(String table) {
        Object result = em.createNativeQuery("SELECT count(*) FROM " + table).getSingleResult();
        return ((Number) result).longValue();
    }

    private UUID currentOrg() {
        OrganizationContext ctx = OrganizationContextHolder.currentOrNull();
        return ctx == null ? null : ctx.organizationId().value();
    }
}