package com.eip.modules.cms.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.cms.domain.model.AccessProfile;
import com.eip.modules.cms.domain.port.in.GerenciarPerfisAcessoUseCase;
import com.eip.modules.cms.domain.port.out.AccessProfileRepositoryPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the tenant access-profile use cases.
 * Tenant-scoped and emitting outbox events on writes.
 */
@Service
@RequiredArgsConstructor
public class AccessProfileService implements GerenciarPerfisAcessoUseCase {

    private final AccessProfileRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PerfilView> listar() {
        return repo.listar(currentOrg()).stream().map(PerfilView::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PerfilView porId(UUID id) {
        return PerfilView.from(load(id));
    }

    @Override
    @Transactional
    public PerfilView criar(CriarPerfilCommand cmd) {
        UUID org = currentOrg();
        AccessProfile p = AccessProfile.novo(org, cmd.name(), cmd.description(),
                cmd.color(), cmd.permissions());
        AccessProfile salvo = repo.salvar(p);
        outbox.record("AccessProfile", salvo.id().toString(), org, "PerfilCriado",
                CmsSupport.payload("accessProfileId", salvo.id(), org));
        return PerfilView.from(salvo);
    }

    @Override
    @Transactional
    public PerfilView atualizar(UUID id, AtualizarPerfilCommand cmd) {
        UUID org = currentOrg();
        AccessProfile p = load(id);
        if (p.isSystem()) {
            throw new BusinessRuleException("Perfil de sistema nao pode ser alterado");
        }
        p.renomear(cmd.name(), cmd.description());
        p.alterarPermissoes(cmd.permissions());
        AccessProfile salvo = repo.salvar(p);
        outbox.record("AccessProfile", salvo.id().toString(), org, "PerfilAtualizado",
                CmsSupport.payload("accessProfileId", salvo.id(), org));
        return PerfilView.from(salvo);
    }

    @Override
    @Transactional
    public void remover(UUID id) {
        UUID org = currentOrg();
        AccessProfile p = load(id);
        if (p.isSystem()) {
            throw new BusinessRuleException("Perfil de sistema nao pode ser removido");
        }
        repo.remover(id, org);
        outbox.record("AccessProfile", id.toString(), org, "PerfilAtualizado",
                CmsSupport.payload("accessProfileId", id, org));
    }

    private AccessProfile load(UUID id) {
        return repo.porId(id, currentOrg())
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de acesso nao encontrado: " + id));
    }
}
