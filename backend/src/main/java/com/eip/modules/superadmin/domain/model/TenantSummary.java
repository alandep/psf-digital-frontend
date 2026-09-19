package com.eip.modules.superadmin.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Summary row for the Super Admin tenants list. Pure domain record.
 *
 * @param organizationId tenant id
 * @param company        tenant/company name
 * @param planName       subscription plan name, may be {@code null}
 * @param status         subscription status, may be {@code null}
 * @param mrr            monthly recurring revenue for this tenant
 */
public record TenantSummary(
        UUID organizationId,
        String company,
        String planName,
        String status,
        BigDecimal mrr) {
}
