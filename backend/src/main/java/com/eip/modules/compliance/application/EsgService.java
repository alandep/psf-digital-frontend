package com.eip.modules.compliance.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.compliance.domain.model.EsgAvaliacao;
import com.eip.modules.compliance.domain.model.EsgStatus;
import com.eip.modules.compliance.domain.port.in.ConsultarEsgUseCase;
import com.eip.modules.compliance.domain.port.out.EsgRepositoryPort;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the ESG assessment use cases.
 */
@Service
@RequiredArgsConstructor
public class EsgService implements ConsultarEsgUseCase {

    private final EsgRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EsgView> listar() {
        UUID org = currentOrg();
        return repo.listar(org).stream().map(EsgView::from).toList();
    }

    @Override
    @Transactional
    public EsgView criar(CriarEsgCommand cmd) {
        UUID org = currentOrg();
        EsgAvaliacao e = EsgAvaliacao.nova(
                org,
                cmd.periodo(),
                cmd.scoreAmbiental(),
                cmd.scoreSocial(),
                cmd.scoreGovernanca(),
                cmd.scoreTotal(),
                ComplianceEnums.parseOrNull(EsgStatus.class, cmd.status(), "status"));
        EsgAvaliacao salvo = repo.salvar(e);
        outbox.record("EsgAvaliacao", salvo.id().toString(), org, "EsgAvaliacaoCriada",
                ComplianceEnums.payload("esgId", salvo.id(), org));
        return EsgView.from(salvo);
    }
}
