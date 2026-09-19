package com.eip.modules.superadmin.domain.port.in;

import java.util.List;

import com.eip.modules.superadmin.domain.model.FunnelStage;
import com.eip.modules.superadmin.domain.model.SaasMetrics;
import com.eip.modules.superadmin.domain.model.TenantSummary;
import com.eip.modules.superadmin.domain.model.UnitEconomics;

/**
 * Inbound port: read-side SaaS analytics powering the Super Admin command
 * center (metrics, tenants, commercial funnel and unit economics).
 */
public interface ConsultarMetricasUseCase {

    /** Aggregated SaaS metrics (MRR/ARR/ARPA and status counts). */
    SaasMetrics metricas();

    /** One summary row per tenant. */
    List<TenantSummary> tenants();

    /** The commercial funnel, ordered, with per-stage conversion. */
    List<FunnelStage> funil();

    /** Per-tenant unit economics (contribution, margin, score). */
    List<UnitEconomics> unitEconomics();
}
