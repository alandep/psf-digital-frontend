package com.eip.modules.compliance.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.compliance.domain.model.RiskLevel;
import com.eip.modules.compliance.domain.model.Screening;
import com.eip.modules.compliance.domain.port.in.GerenciarScreeningUseCase;
import com.eip.modules.compliance.domain.port.out.ScreeningRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the screening use cases. Writes are
 * transactional and emit outbox events; queries are read-only.
 */
@Service
@RequiredArgsConstructor
public class ScreeningService implements GerenciarScreeningUseCase {

    private final ScreeningRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScreeningView> listar(String status) {
        UUID org = currentOrg();
        return repo.listar(org, status).stream().map(ScreeningView::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ScreeningView porId(UUID id) {
        UUID org = currentOrg();
        Screening s = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Screening nao encontrado: " + id));
        return ScreeningView.from(s);
    }

    @Override
    @Transactional
    public ScreeningView criar(CriarScreeningCommand cmd) {
        UUID org = currentOrg();
        Screening s = Screening.novo(
                org,
                cmd.entityName(),
                cmd.entityType(),
                cmd.document(),
                cmd.listsChecked());
        Screening salvo = repo.salvar(s);
        outbox.record("Screening", salvo.id().asString(), org, "ScreeningCriado",
                ComplianceEnums.payload("screeningId", salvo.id().value(), org));
        return ScreeningView.from(salvo);
    }

    @Override
    @Transactional
    public ScreeningView iniciarAnalise(UUID id) {
        UUID org = currentOrg();
        Screening s = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Screening nao encontrado: " + id));
        s.iniciarAnalise();
        Screening salvo = repo.salvar(s);
        return ScreeningView.from(salvo);
    }

    @Override
    @Transactional
    public ScreeningView aprovar(UUID id, AprovarCommand cmd) {
        UUID org = currentOrg();
        Screening s = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Screening nao encontrado: " + id));
        s.aprovar(ComplianceEnums.parse(RiskLevel.class, cmd.riskLevel(), "riskLevel"), cmd.summary());
        Screening salvo = repo.salvar(s);
        outbox.record("Screening", salvo.id().asString(), org, "ScreeningAprovado",
                ComplianceEnums.payload("screeningId", salvo.id().value(), org));
        return ScreeningView.from(salvo);
    }

    @Override
    @Transactional
    public ScreeningView reprovar(UUID id, ReprovarCommand cmd) {
        UUID org = currentOrg();
        Screening s = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Screening nao encontrado: " + id));
        s.reprovar(cmd.summary());
        Screening salvo = repo.salvar(s);
        outbox.record("Screening", salvo.id().asString(), org, "ScreeningReprovado",
                ComplianceEnums.payload("screeningId", salvo.id().value(), org));
        return ScreeningView.from(salvo);
    }
}
