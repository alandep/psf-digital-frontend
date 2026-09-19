package com.eip.modules.subscription.adapter.in;

import java.util.UUID;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.model.Subscription;
import com.eip.modules.subscription.domain.port.out.SubscriptionRepositoryPort;
import com.eip.platform.security.LicenseGate;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Wires the platform {@link LicenseGate} to the real subscription state. This
 * @Primary override replaces the mock FULL default: it reads the current org's
 * subscription status and maps the domain license mode to the platform enum.
 *
 * <p>When there is no organization context or no subscription (e.g. dev,
 * unauthenticated flows), it falls back to {@link LicenseMode#FULL} to stay
 * dev-friendly and non-blocking.
 */
@Component
@Primary
@RequiredArgsConstructor
public class SubscriptionLicenseModeResolver extends LicenseGate {

    private final SubscriptionRepositoryPort subscriptionRepo;

    @Override
    protected LicenseMode currentMode() {
        OrganizationContext ctx = OrganizationContextHolder.currentOrNull();
        if (ctx == null) {
            // No tenant bound (dev / pre-auth): do not block.
            return LicenseMode.FULL;
        }
        UUID org = ctx.organizationId().value();
        Subscription sub = subscriptionRepo.currentForOrg(org).orElse(null);
        if (sub == null) {
            return LicenseMode.FULL;
        }
        return map(sub);
    }

    private static LicenseMode map(Subscription sub) {
        return switch (sub.licenseMode()) {
            case FULL -> LicenseMode.FULL;
            case READ_ONLY -> LicenseMode.READ_ONLY;
            case BILLING_ONLY -> LicenseMode.BILLING_ONLY;
            case NONE -> LicenseMode.NONE;
        };
    }
}
