package com.eip.modules.superadmin.domain.port.out;

import java.util.List;

import com.eip.modules.superadmin.domain.model.SaasMetrics;
import com.eip.modules.superadmin.domain.model.TenantSummary;
import com.eip.modules.superadmin.domain.model.UnitEconomics;

/**
 * Outbound port: read-side aggregation queries for SaaS metrics, tenants and
 * unit economics. Implementations run COUNT/SUM aggregations over the shared
 * {@code subscription}, {@code organization} and {@code ai_usage_event} tables.
 */
public interface MetricsRepositoryPort {

    /** Aggregated SaaS metrics (MRR/ARR/ARPA and subscription status counts). */
    SaasMetrics aggregateMetrics();

    /** One summary row per tenant (organization joined with its subscription). */
    List<TenantSummary> tenantSummaries();

    /** Per-tenant unit economics combining subscription revenue and AI/OCR cost. */
    List<UnitEconomics> unitEconomics();
}
