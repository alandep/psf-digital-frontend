package com.eip.modules.crm.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.crm.domain.model.Cliente;
import com.eip.modules.crm.domain.model.ClienteStatus;
import com.eip.modules.crm.domain.port.in.GerenciarClientesUseCase;
import com.eip.modules.crm.domain.port.out.ClienteRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the CRM customer use cases. Writes are
 * transactional and emit outbox events; queries are read-only.
 */
@Service
@RequiredArgsConstructor
public class ClienteService implements GerenciarClientesUseCase {

    private final ClienteRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteView> listar(String status) {
        UUID org = currentOrg();
        CrmEnums.parseOptional(ClienteStatus.class, status, "status");
        return repo.listar(org, normalize(status)).stream().map(ClienteView::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteView porId(UUID id) {
        UUID org = currentOrg();
        Cliente c = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente nao encontrado: " + id));
        return ClienteView.from(c);
    }

    @Override
    @Transactional
    public ClienteView criar(CriarClienteCommand cmd) {
        UUID org = currentOrg();
        Cliente c = Cliente.novo(org, cmd.name(), cmd.cnpj(), cmd.segmento(), cmd.pais());
        Cliente salvo = repo.salvar(c);
        outbox.record("Cliente", salvo.id().asString(), org, "ClienteCriado",
                CrmEnums.payload("clienteId", salvo.id().value(), org));
        return ClienteView.from(salvo);
    }

    @Override
    @Transactional
    public ClienteView ativar(UUID id) {
        UUID org = currentOrg();
        Cliente c = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente nao encontrado: " + id));
        c.ativar();
        Cliente salvo = repo.salvar(c);
        outbox.record("Cliente", salvo.id().asString(), org, "ClienteAtivado",
                CrmEnums.payload("clienteId", salvo.id().value(), org));
        return ClienteView.from(salvo);
    }

    @Override
    @Transactional
    public ClienteView inativar(UUID id) {
        UUID org = currentOrg();
        Cliente c = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente nao encontrado: " + id));
        c.inativar();
        Cliente salvo = repo.salvar(c);
        outbox.record("Cliente", salvo.id().asString(), org, "ClienteInativado",
                CrmEnums.payload("clienteId", salvo.id().value(), org));
        return ClienteView.from(salvo);
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim().toUpperCase();
    }
}
