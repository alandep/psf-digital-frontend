package com.eip.modules.superadmin.application;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.superadmin.domain.model.FunnelStage;
import com.eip.modules.superadmin.domain.model.SaasMetrics;
import com.eip.modules.superadmin.domain.model.TenantSummary;
import com.eip.modules.superadmin.domain.model.UnitEconomics;
import com.eip.modules.superadmin.domain.port.in.ConsultarMetricasUseCase;
import com.eip.modules.superadmin.domain.port.out.FunnelRepositoryPort;
import com.eip.modules.superadmin.domain.port.out.MetricsRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the Super Admin read-side analytics. All
 * operations are read-only.
 *
 * <p><b>RLS caveat (cross-tenant):</b> The SaaS metrics, tenants and unit
 * economics are aggregations ACROSS all tenants. The underlying tables
 * ({@code subscription}, {@code product_event}, {@code ai_usage_event}) are
 * RLS-protected per tenant, so under the current request-scoped org context
 * these queries only see the ACTIVE organization's rows. A real Super Admin
 * would run them under either (a) a privileged DB role that bypasses RLS, or
 * (b) a separate reporting read model populated by events. This service keeps
 * the aggregation logic correct and honest; it does NOT attempt to hack RLS.
 */
@Service
@RequiredArgsConstructor
public class MetricsService implements ConsultarMetricasUseCase {

    private final MetricsRepositoryPort metricsRepo;
    private final FunnelRepositoryPort funnelRepo;

    @Override
    @Transactional(readOnly = true)
    public SaasMetrics metricas() {
        // TODO(RLS): cross-tenant aggregation is limited by RLS under the active
        // org context. Introduce a reporting role / read model to see all tenants.
        return metricsRepo.aggregateMetrics();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenantSummary> tenants() {
        // TODO(RLS): see class-level note. Cross-tenant list is RLS-limited today.
        return metricsRepo.tenantSummaries();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnitEconomics> unitEconomics() {
        // TODO(RLS): see class-level note. Cross-tenant economics are RLS-limited.
        return metricsRepo.unitEconomics();
    }

    /**
     * Canonical funnel ordering: label plus the {@code product_event} names that
     * feed each stage. Stages without a backing event (e.g. Visitantes) resolve
     * to zero from the counts map.
     */
    private static final List<Stage> CANONICAL = List.of(
            new Stage("visitantes", "Visitantes", "SIGNUP_STARTED"),
            new Stage("leads", "Leads", "SIGNUP_COMPLETED"),
            new Stage("demo", "Demo", "PLAN_VIEWED"),
            new Stage("trial", "Trial", "ONBOARDING_STARTED"),
            new Stage("checkout", "Checkout", "CHECKOUT_STARTED"),
            new Stage("pagantes", "Pagantes", "CHECKOUT_COMPLETED"),
            new Stage("ativados", "Ativados", "PRODUCT_CREATED"),
            new Stage("primeira-exportacao", "Primeira Exportacao", "FIRST_EXPORT_CREATED"),
            new Stage("ativos-30d", "Ativos 30d", "EXPORT_CREATED"));

    @Override
    @Transactional(readOnly = true)
    public List<FunnelStage> funil() {
        // The port returns raw per-event counts; we map them to the canonical
        // funnel order and compute conversion from the previous stage here.
        Map<String, Long> counts = new LinkedHashMap<>();
        for (FunnelStage s : funnelRepo.funnel()) {
            counts.put(s.key(), s.count());
        }
        List<FunnelStage> result = new ArrayList<>();
        Long prev = null;
        for (Stage stage : CANONICAL) {
            long count = counts.getOrDefault(stage.eventName(), 0L);
            Integer conversion = null;
            if (prev != null && prev > 0) {
                conversion = (int) Math.round((count * 100.0) / prev);
            }
            result.add(new FunnelStage(stage.key(), stage.label(), count, conversion));
            prev = count;
        }
        return result;
    }

    /** Internal mapping of a funnel stage to its backing event name. */
    private record Stage(String key, String label, String eventName) {
    }
}
