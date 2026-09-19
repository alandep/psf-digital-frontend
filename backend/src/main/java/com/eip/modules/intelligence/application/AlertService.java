package com.eip.modules.intelligence.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.intelligence.domain.model.IntelligenceAlert;
import com.eip.modules.intelligence.domain.port.in.ConsultarAlertasUseCase;
import com.eip.modules.intelligence.domain.port.out.AlertRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the tenant alert use cases.
 */
@Service
@RequiredArgsConstructor
public class AlertService implements ConsultarAlertasUseCase {

    private final AlertRepositoryPort repo;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlertView> listar() {
        return repo.listar(currentOrg()).stream().map(AlertView::from).toList();
    }

    @Override
    @Transactional
    public AlertView marcarLida(UUID id) {
        UUID org = currentOrg();
        IntelligenceAlert a = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta nao encontrado: " + id));
        a.marcarLida();
        return AlertView.from(repo.salvar(a));
    }

    @Override
    @Transactional(readOnly = true)
    public long naoLidas() {
        return repo.countUnread(currentOrg());
    }
}
