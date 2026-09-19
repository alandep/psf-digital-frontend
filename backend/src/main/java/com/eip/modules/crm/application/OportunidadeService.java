package com.eip.modules.crm.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.crm.domain.model.ClienteId;
import com.eip.modules.crm.domain.model.EstagioOportunidade;
import com.eip.modules.crm.domain.model.Oportunidade;
import com.eip.modules.crm.domain.port.in.GerenciarOportunidadesUseCase;
import com.eip.modules.crm.domain.port.out.OportunidadeRepositoryPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the opportunity use cases. Writes are
 * transactional and emit outbox events; queries are read-only.
 */
@Service
@RequiredArgsConstructor
public class OportunidadeService implements GerenciarOportunidadesUseCase {

    private final OportunidadeRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OportunidadeView> listar(String estagio) {
        UUID org = currentOrg();
        CrmEnums.parseOptional(EstagioOportunidade.class, estagio, "estagio");
        return repo.listar(org, normalize(estagio)).stream().map(OportunidadeView::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OportunidadeView porId(UUID id) {
        UUID org = currentOrg();
        Oportunidade o = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Oportunidade nao encontrada: " + id));
        return OportunidadeView.from(o);
    }

    @Override
    @Transactional
    public OportunidadeView criar(CriarOportunidadeCommand cmd) {
        UUID org = currentOrg();
        if (cmd.clienteId() == null) {
            throw new BusinessRuleException("Cliente da oportunidade e obrigatorio");
        }
        Oportunidade o = Oportunidade.nova(
                org,
                ClienteId.of(cmd.clienteId()),
                cmd.titulo(),
                cmd.valorEstimado(),
                cmd.moeda(),
                cmd.probabilidade(),
                cmd.fechamentoPrevisto());
        Oportunidade salvo = repo.salvar(o);
        outbox.record("Oportunidade", salvo.id().asString(), org, "OportunidadeCriada",
                CrmEnums.payload("oportunidadeId", salvo.id().value(), org));
        return OportunidadeView.from(salvo);
    }

    @Override
    @Transactional
    public OportunidadeView avancar(UUID id, EstagioCommand cmd) {
        UUID org = currentOrg();
        Oportunidade o = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Oportunidade nao encontrada: " + id));
        o.avancarEstagio(CrmEnums.parse(EstagioOportunidade.class, cmd.estagio(), "estagio"));
        Oportunidade salvo = repo.salvar(o);
        outbox.record("Oportunidade", salvo.id().asString(), org, "OportunidadeAvancada",
                CrmEnums.payload("oportunidadeId", salvo.id().value(), org));
        return OportunidadeView.from(salvo);
    }

    @Override
    @Transactional
    public OportunidadeView ganhar(UUID id) {
        UUID org = currentOrg();
        Oportunidade o = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Oportunidade nao encontrada: " + id));
        o.ganhar();
        Oportunidade salvo = repo.salvar(o);
        outbox.record("Oportunidade", salvo.id().asString(), org, "OportunidadeGanha",
                CrmEnums.payload("oportunidadeId", salvo.id().value(), org));
        return OportunidadeView.from(salvo);
    }

    @Override
    @Transactional
    public OportunidadeView perder(UUID id) {
        UUID org = currentOrg();
        Oportunidade o = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Oportunidade nao encontrada: " + id));
        o.perder();
        Oportunidade salvo = repo.salvar(o);
        outbox.record("Oportunidade", salvo.id().asString(), org, "OportunidadePerdida",
                CrmEnums.payload("oportunidadeId", salvo.id().value(), org));
        return OportunidadeView.from(salvo);
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim().toUpperCase();
    }
}
