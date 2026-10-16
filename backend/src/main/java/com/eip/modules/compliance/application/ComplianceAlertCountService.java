package com.eip.modules.compliance.application;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.compliance.adapter.out.persistence.ScreeningJpaRepository;
import com.eip.modules.compliance.domain.port.in.ComplianceAlertCountPort;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing {@link ComplianceAlertCountPort}.
 *
 * <p>Dedicated to the single responsibility of counting compliance alerts of the
 * current tenant, kept separate from {@link ScreeningService} (which owns the
 * screening lifecycle use cases). The count is pushed down to the database via a
 * {@code COUNT} query — no screening rows are loaded into memory.
 *
 * <p>An alert is a screening of the current tenant that is pending / under
 * analysis ({@code PENDENTE} or {@code EM_ANALISE}) OR classified as high risk
 * ({@code ALTO} or {@code CRITICO}), optionally restricted to the window
 * {@code [from, to)} by {@code created_at}. The tenant is resolved from the
 * request-scoped context and further enforced by RLS on the {@code screening}
 * table.
 */
@Service
@RequiredArgsConstructor
public class ComplianceAlertCountService implements ComplianceAlertCountPort {

    private final ScreeningJpaRepository repo;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public long contarAlertas(OffsetDateTime from, OffsetDateTime to) {
        return repo.countAlertas(currentOrg(), from, to);
    }
}
