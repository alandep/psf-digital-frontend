package com.eip.modules.cms.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.cms.domain.model.AppNotification;
import com.eip.modules.cms.domain.port.in.ConsultarNotificacoesUseCase;
import com.eip.modules.cms.domain.port.out.NotificationRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the tenant in-app notification use cases.
 * Tenant-scoped.
 */
@Service
@RequiredArgsConstructor
public class NotificationService implements ConsultarNotificacoesUseCase {

    private final NotificationRepositoryPort repo;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationView> listar() {
        return repo.listar(currentOrg()).stream().map(NotificationView::from).toList();
    }

    @Override
    @Transactional
    public NotificationView marcarLida(UUID id) {
        UUID org = currentOrg();
        AppNotification n = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Notificacao nao encontrada: " + id));
        n.marcarLida();
        return NotificationView.from(repo.salvar(n));
    }

    @Override
    @Transactional(readOnly = true)
    public long naoLidas() {
        return repo.countUnread(currentOrg());
    }

    @Override
    @Transactional
    public void marcarTodasLidas() {
        repo.marcarTodasLidas(currentOrg());
    }
}
