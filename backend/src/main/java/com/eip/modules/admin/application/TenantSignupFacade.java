package com.eip.modules.admin.application;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.admin.TenantSignupApi;
import com.eip.modules.admin.application.SignupService.SignupCommand;
import com.eip.modules.admin.application.SignupService.SignupResult;
import com.eip.modules.admin.domain.port.out.TenantSubscriptionPort;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;
import com.eip.platform.tenant.TenantScope;

import lombok.RequiredArgsConstructor;

/**
 * Implements the admin module's {@link TenantSignupApi} on top of
 * {@link SignupService} and {@link TenantSubscriptionPort}.
 */
@Service
@RequiredArgsConstructor
public class TenantSignupFacade implements TenantSignupApi {

    private final SignupService signupService;
    private final TenantSubscriptionPort tenantSubscriptions;
    private final TenantScope tenantScope;

    @Override
    @Transactional
    public CreatedTenant createTenant(NewTenant t) {
        SignupResult r = signupService.signup(new SignupCommand(
                t.adminName(), t.adminCpf(), t.adminEmail(), t.adminPhone(), t.password(),
                t.cnpj(), t.razaoSocial(), t.nomeFantasia(), t.segmento(), List.of(),
                t.planCode(), t.planName(), t.billingInterval(), t.amount(), t.trialDays(),
                t.companyEmail(), t.companyPhone()));
        return new CreatedTenant(r.organizationId(), r.userId(), r.trialEnd());
    }

    @Override
    @Transactional
    public void applyPlanEntitlements(UUID organizationId, String planCode) {
        OrganizationContext ctx = OrganizationContextHolder.currentOrNull();
        UUID userId = ctx != null ? ctx.userId() : null;
        tenantScope.runAs(organizationId, userId, () ->
                tenantSubscriptions.applyPlanEntitlements(organizationId, planCode,
                        OffsetDateTime.now()));
    }
}
