package com.eip.modules.bi.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.bi.domain.model.Dashboard;
import com.eip.modules.bi.domain.model.Widget;
import com.eip.modules.bi.domain.port.in.GerenciarDashboardsUseCase;
import com.eip.modules.bi.domain.port.out.DashboardRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the dashboard use cases.
 */
@Service
@RequiredArgsConstructor
public class DashboardService implements GerenciarDashboardsUseCase {

    private final DashboardRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    private static UUID currentUser() {
        return OrganizationContextHolder.current().userId();
    }

    private static List<Widget> toWidgets(List<WidgetCommand> cmds) {
        if (cmds == null) {
            return List.of();
        }
        return cmds.stream()
                .map(w -> new Widget(w.id(), w.tipo(), w.titulo(), w.config(), w.ordem()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DashboardView> listar() {
        UUID org = currentOrg();
        return repo.listar(org).stream().map(DashboardView::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardView porId(UUID id) {
        UUID org = currentOrg();
        Dashboard d = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Dashboard nao encontrado: " + id));
        return DashboardView.from(d);
    }

    @Override
    @Transactional
    public DashboardView criar(CriarDashboardCommand cmd) {
        UUID org = currentOrg();
        Dashboard d = Dashboard.novo(
                org,
                currentUser(),
                cmd.name(),
                cmd.description(),
                cmd.layout(),
                toWidgets(cmd.widgets()));
        Dashboard salvo = repo.salvar(d);
        outbox.record("Dashboard", salvo.id().asString(), org, "DashboardCriado",
                BiEvents.payload("dashboardId", salvo.id().value(), org));
        return DashboardView.from(salvo);
    }

    @Override
    @Transactional
    public DashboardView atualizar(UUID id, AtualizarDashboardCommand cmd) {
        UUID org = currentOrg();
        Dashboard d = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Dashboard nao encontrado: " + id));
        d.renomear(cmd.name());
        d.alterarDescricao(cmd.description());
        d.alterarLayout(cmd.layout());
        d.substituirWidgets(toWidgets(cmd.widgets()));
        Dashboard salvo = repo.salvar(d);
        outbox.record("Dashboard", salvo.id().asString(), org, "DashboardAtualizado",
                BiEvents.payload("dashboardId", salvo.id().value(), org));
        return DashboardView.from(salvo);
    }

    @Override
    @Transactional
    public DashboardView definirPadrao(UUID id) {
        UUID org = currentOrg();
        Dashboard d = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Dashboard nao encontrado: " + id));
        // Simple approach: mark this dashboard as the default. A full
        // implementation would also clear the default flag on the other
        // dashboards of the organization within the same transaction.
        d.definirComoPadrao();
        Dashboard salvo = repo.salvar(d);
        outbox.record("Dashboard", salvo.id().asString(), org, "DashboardAtualizado",
                BiEvents.payload("dashboardId", salvo.id().value(), org));
        return DashboardView.from(salvo);
    }

    @Override
    @Transactional
    public void remover(UUID id) {
        UUID org = currentOrg();
        repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Dashboard nao encontrado: " + id));
        repo.remover(id, org);
    }
}
