package com.eip.modules.superadmin.adapter.out.persistence;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.eip.modules.superadmin.domain.model.FunnelStage;
import com.eip.modules.superadmin.domain.model.SaasMetrics;
import com.eip.modules.superadmin.domain.model.SaasMetrics.PlanMrr;
import com.eip.modules.superadmin.domain.model.TenantSummary;
import com.eip.modules.superadmin.domain.model.UnitEconomics;
import com.eip.modules.superadmin.domain.port.out.FunnelRepositoryPort;
import com.eip.modules.superadmin.domain.port.out.MetricsRepositoryPort;

/**
 * Read-side aggregation adapter implementing {@link MetricsRepositoryPort} and
 * {@link FunnelRepositoryPort}. Aggregates over the shared {@code subscription},
 * {@code organization} and {@code ai_usage_event} tables, plus the
 * {@code product_event} ledger.
 *
 * <p><b>Cross-tenant reporting path.</b> These aggregations must span EVERY
 * tenant, but the application's main role is RLS-enforced and request-scoped to
 * one org. Cross-tenant reads therefore run through the reporting
 * {@link JdbcTemplate} (see {@code ReportingDataSourceConfig}), which uses a
 * dedicated read-only {@code eip_report} role with {@code BYPASSRLS}. That role
 * has SELECT only on the reporting tables and is never used for writes, so RLS
 * remains fully enforced for normal tenant traffic. The reporting JdbcTemplate
 * is injected {@link Lazy} so a missing reporting role does not affect startup.
 */
@Component
public class MetricsJpaAdapter implements MetricsRepositoryPort, FunnelRepositoryPort {

    /** OCR cost proxy: estimated cost per OCR page, in the metrics currency. */
    private static final BigDecimal OCR_COST_PER_PAGE = new BigDecimal("0.02");

    private final JdbcTemplate reportingJdbc;

    public MetricsJpaAdapter(
            @Lazy @Qualifier("reportingJdbcTemplate") JdbcTemplate reportingJdbc) {
        this.reportingJdbc = reportingJdbc;
    }

    @Override
    public SaasMetrics aggregateMetrics() {
        BigDecimal mrr = reportingJdbc.queryForObject(
                "SELECT COALESCE(SUM(amount), 0) FROM subscription WHERE status = 'ACTIVE'",
                BigDecimal.class);
        long active = countByStatus("status = 'ACTIVE'");
        long trials = countByStatus("status = 'TRIALING'");
        long pastDue = countByStatus("status IN ('PAST_DUE', 'GRACE_PERIOD')");
        long canceled = countByStatus("status IN ('CANCELED', 'TERMINATED')");

        List<PlanMrr> mrrByPlan = reportingJdbc.query(
                "SELECT plan_name, COALESCE(SUM(amount), 0) AS plan_mrr FROM subscription "
                        + "WHERE status = 'ACTIVE' GROUP BY plan_name",
                (rs, rowNum) -> new PlanMrr(
                        rs.getString("plan_name"),
                        rs.getBigDecimal("plan_mrr").setScale(2, RoundingMode.HALF_UP)));

        mrr = (mrr == null ? BigDecimal.ZERO : mrr).setScale(2, RoundingMode.HALF_UP);
        BigDecimal arr = mrr.multiply(BigDecimal.valueOf(12)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal arpa = active == 0
                ? BigDecimal.ZERO.setScale(2)
                : mrr.divide(BigDecimal.valueOf(active), 2, RoundingMode.HALF_UP);
        return new SaasMetrics(mrr, arr, arpa, active, trials, pastDue, canceled, mrrByPlan);
    }

    private long countByStatus(String predicate) {
        Long count = reportingJdbc.queryForObject(
                "SELECT COUNT(*) FROM subscription WHERE " + predicate, Long.class);
        return count == null ? 0L : count;
    }

    @Override
    public List<TenantSummary> tenantSummaries() {
        return reportingJdbc.query("""
                SELECT o.id AS org_id, o.name AS org_name, o.status AS org_status,
                       s.plan_name AS plan_name, s.status AS sub_status, s.amount AS amount
                FROM organization o
                LEFT JOIN LATERAL (
                    SELECT plan_name, status, amount
                    FROM subscription sub
                    WHERE sub.organization_id = o.id
                    ORDER BY sub.created_at DESC
                    LIMIT 1
                ) s ON true
                """, (rs, rowNum) -> {
            UUID orgId = rs.getObject("org_id", UUID.class);
            BigDecimal amount = rs.getBigDecimal("amount");
            BigDecimal mrr = amount == null
                    ? BigDecimal.ZERO.setScale(2)
                    : amount.setScale(2, RoundingMode.HALF_UP);
            String subStatus = rs.getString("sub_status");
            return new TenantSummary(
                    orgId,
                    rs.getString("org_name"),
                    rs.getString("plan_name"),
                    subStatus != null ? subStatus : rs.getString("org_status"),
                    mrr);
        });
    }

    @Override
    public List<UnitEconomics> unitEconomics() {
        return reportingJdbc.query("""
                SELECT s.organization_id AS org_id, o.name AS org_name,
                       s.amount AS subscription_amount,
                       COALESCE(SUM(u.provider_cost), 0) AS ai_cost,
                       COALESCE(SUM(u.ocr_pages), 0) AS ocr_pages
                FROM subscription s
                LEFT JOIN organization o ON o.id = s.organization_id
                LEFT JOIN ai_usage_event u ON u.organization_id = s.organization_id
                GROUP BY s.organization_id, o.name, s.amount
                """, (rs, rowNum) -> {
            UUID orgId = rs.getObject("org_id", UUID.class);
            BigDecimal subscription = rs.getBigDecimal("subscription_amount");
            BigDecimal aiCost = rs.getBigDecimal("ai_cost");
            long ocrPages = rs.getLong("ocr_pages");
            BigDecimal ocrCost = OCR_COST_PER_PAGE.multiply(BigDecimal.valueOf(ocrPages));
            String name = rs.getString("org_name");
            return UnitEconomics.of(orgId, name == null ? "?" : name,
                    subscription, aiCost, ocrCost);
        });
    }

    /**
     * Returns raw per-event counts as {@link FunnelStage}s keyed by the event
     * name (label mirrors the key here). Aggregated GLOBALLY across all tenants
     * via the reporting (BYPASSRLS) JdbcTemplate. The application layer maps
     * these to the canonical funnel order and computes conversion percentages.
     */
    @Override
    public List<FunnelStage> funnel() {
        List<FunnelStage> stages = new ArrayList<>();
        reportingJdbc.query(
                "SELECT event, COUNT(*) AS total FROM product_event GROUP BY event",
                rs -> {
                    String event = rs.getString("event");
                    stages.add(new FunnelStage(event, event, rs.getLong("total"), null));
                });
        return stages;
    }
}
