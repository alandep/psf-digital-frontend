package com.eip.modules.compliance.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.compliance.domain.port.in.ConsultarAuditoriaUseCase;
import com.eip.modules.compliance.domain.port.out.AuditEventRepositoryPort;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the audit-trail consultation use case.
 */
@Service
@RequiredArgsConstructor
public class AuditoriaService implements ConsultarAuditoriaUseCase {

    private static final int RECENT_LIMIT = 50;

    private final AuditEventRepositoryPort repo;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditView> listar(String resourceType) {
        UUID org = currentOrg();
        return repo.listar(org, resourceType, RECENT_LIMIT).stream().map(AuditView::from).toList();
    }
}
