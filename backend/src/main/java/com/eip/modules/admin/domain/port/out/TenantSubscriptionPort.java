package com.eip.modules.admin.domain.port.out;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Writes the tenant-scoped (RLS) subscription and entitlement snapshot of an
 * organization. Callers must run inside a transaction whose org context is the
 * target organization (see {@code TenantScope}).
 */
public interface TenantSubscriptionPort {

    /** Inserts the first subscription of a freshly created organization. */
    void createSubscription(InitialSubscription subscription);

    /** (Re)applies the plan's {@code plan_feature} rows as the org entitlements. */
    void applyPlanEntitlements(UUID organizationId, String planCode, OffsetDateTime now);

    record InitialSubscription(UUID organizationId, String planCode, String planName,
            String billingInterval, BigDecimal amount, String status,
            OffsetDateTime periodStart, OffsetDateTime periodEnd, OffsetDateTime trialEnd) {
    }
}
