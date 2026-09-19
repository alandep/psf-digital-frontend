package com.eip.modules.bi.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.bi.domain.model.SavedQuery;
import com.eip.modules.bi.domain.port.in.GerenciarConsultasUseCase;
import com.eip.modules.bi.domain.port.out.SavedQueryRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the saved data-explorer query use cases.
 */
@Service
@RequiredArgsConstructor
public class SavedQueryService implements GerenciarConsultasUseCase {

    private final SavedQueryRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    private static UUID currentUser() {
        return OrganizationContextHolder.current().userId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SavedQueryView> listar() {
        UUID org = currentOrg();
        return repo.listar(org).stream().map(SavedQueryView::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SavedQueryView porId(UUID id) {
        UUID org = currentOrg();
        SavedQuery q = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta nao encontrada: " + id));
        return SavedQueryView.from(q);
    }

    @Override
    @Transactional
    public SavedQueryView criar(CriarConsultaCommand cmd) {
        UUID org = currentOrg();
        SavedQuery q = SavedQuery.nova(org, currentUser(), cmd.name(), cmd.dataset(),
                cmd.queryJson());
        SavedQuery salvo = repo.salvar(q);
        outbox.record("SavedQuery", salvo.id().asString(), org, "ConsultaSalva",
                BiEvents.payload("savedQueryId", salvo.id().value(), org));
        return SavedQueryView.from(salvo);
    }

    @Override
    @Transactional
    public SavedQueryView atualizar(UUID id, AtualizarConsultaCommand cmd) {
        UUID org = currentOrg();
        SavedQuery q = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta nao encontrada: " + id));
        q.atualizar(cmd.name(), cmd.queryJson());
        SavedQuery salvo = repo.salvar(q);
        outbox.record("SavedQuery", salvo.id().asString(), org, "ConsultaSalva",
                BiEvents.payload("savedQueryId", salvo.id().value(), org));
        return SavedQueryView.from(salvo);
    }

    @Override
    @Transactional
    public void remover(UUID id) {
        UUID org = currentOrg();
        repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta nao encontrada: " + id));
        repo.remover(id, org);
    }
}
