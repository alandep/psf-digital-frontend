package com.eip.modules.admin;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Public API of the admin module used by the billing checkout: provisions a new
 * tenant exactly like the self-service signup (user, organization, legal
 * entity, membership, TRIALING subscription and entitlements) and re-applies
 * plan entitlements after a plan change.
 */
public interface TenantSignupApi {

    /**
     * Creates the tenant in the current transaction (joins it).
     *
     * @throws com.eip.platform.error.BusinessRuleException on validation errors
     *         (invalid CPF/CNPJ, e-mail or CNPJ already registered, ...)
     */
    CreatedTenant createTenant(NewTenant tenant);

    /** Re-applies the plan's entitlements to the organization (current transaction). */
    void applyPlanEntitlements(UUID organizationId, String planCode);

    /** Signup data. {@code amount} is the full plan price for the interval. */
    record NewTenant(String adminName, String adminCpf, String adminEmail, String adminPhone,
            String password, String cnpj, String razaoSocial, String nomeFantasia,
            String segmento, String companyEmail, String companyPhone, String planCode,
            String planName, String billingInterval, BigDecimal amount, int trialDays) {

        @Override
        public String toString() {
            return "NewTenant[cnpj=" + cnpj + ", plan=" + planCode + "]";
        }
    }

    record CreatedTenant(UUID organizationId, UUID userId, OffsetDateTime trialEnd) {
    }
}
