package com.eip.modules.compliance.domain.port.in;

import java.time.OffsetDateTime;

/**
 * Public API of the compliance module (Spring Modulith) for counting compliance
 * alerts of the current tenant. Exposed as an inbound port so that other modules
 * (e.g. the dashboard analytics in the {@code export} module) can obtain the
 * alert count through the module's published contract instead of querying the
 * compliance tables cross-schema.
 *
 * <p><strong>Definition of a compliance alert:</strong> a screening of the
 * current tenant that is either not yet resolved
 * ({@link com.eip.modules.compliance.domain.model.ScreeningStatus#PENDENTE} or
 * {@link com.eip.modules.compliance.domain.model.ScreeningStatus#EM_ANALISE})
 * OR classified as high risk
 * ({@link com.eip.modules.compliance.domain.model.RiskLevel#ALTO} or
 * {@link com.eip.modules.compliance.domain.model.RiskLevel#CRITICO}). A screening
 * that satisfies both conditions is counted once.
 */
public interface ComplianceAlertCountPort {

    /**
     * Counts the compliance alerts of the current tenant.
     *
     * <p>Counts {@code screening} rows of the current tenant that are in a
     * pending / under-analysis state ({@code PENDENTE} or {@code EM_ANALISE})
     * <em>or</em> that are classified as high risk ({@code ALTO} or
     * {@code CRITICO}). The count is restricted to the current tenant: the
     * organization is resolved from the request-scoped tenant context and
     * further enforced by Row-Level Security on the {@code screening} table.
     *
     * <p>The optional window {@code [from, to)} filters by the screening
     * {@code created_at} timestamp: {@code from} is an inclusive lower bound and
     * {@code to} an exclusive upper bound. Either bound may be {@code null},
     * meaning no limit on that side; when both are {@code null} the whole tenant
     * history is considered.
     *
     * @param from inclusive lower bound on {@code created_at}, or {@code null} for no lower bound
     * @param to   exclusive upper bound on {@code created_at}, or {@code null} for no upper bound
     * @return the number of compliance alerts of the current tenant within the window
     */
    long contarAlertas(OffsetDateTime from, OffsetDateTime to);
}
