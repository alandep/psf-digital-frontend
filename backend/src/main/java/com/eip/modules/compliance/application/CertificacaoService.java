package com.eip.modules.compliance.application;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.compliance.domain.model.Certificacao;
import com.eip.modules.compliance.domain.model.CertificacaoStatus;
import com.eip.modules.compliance.domain.port.in.ConsultarCertificacoesUseCase;
import com.eip.modules.compliance.domain.port.out.CertificacaoRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the certification use cases.
 */
@Service
@RequiredArgsConstructor
public class CertificacaoService implements ConsultarCertificacoesUseCase {

    private final CertificacaoRepositoryPort repo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificacaoView> listar(String status) {
        UUID org = currentOrg();
        return repo.listar(org, status).stream().map(CertificacaoView::from).toList();
    }

    @Override
    @Transactional
    public CertificacaoView criar(CriarCertificacaoCommand cmd) {
        UUID org = currentOrg();
        Certificacao c = Certificacao.nova(
                org,
                cmd.name(),
                cmd.tipo(),
                cmd.orgaoEmissor(),
                cmd.numero(),
                ComplianceEnums.parseOrNull(CertificacaoStatus.class, cmd.status(), "status"),
                cmd.emitidaEm(),
                cmd.validaAte(),
                cmd.productId(),
                cmd.productName(),
                cmd.categoria(),
                cmd.descricao(),
                cmd.paisEmissor(),
                cmd.paisDestino(),
                cmd.assinaturaDigital(),
                cmd.complianceStatus(),
                cmd.exportId(),
                cmd.dueNumber(),
                cmd.aiGenerated(),
                cmd.aiConfidenceScore(),
                cmd.aiRiskScore(),
                cmd.aiRiskLevel(),
                cmd.createdBy());
        Certificacao salvo = repo.salvar(c);
        outbox.record("Certificacao", salvo.id().asString(), org, "CertificacaoCriada",
                ComplianceEnums.payload("certificacaoId", salvo.id().value(), org));
        return CertificacaoView.from(salvo);
    }

    @Override
    @Transactional
    public CertificacaoView atualizar(UUID id, CriarCertificacaoCommand cmd) {
        UUID org = currentOrg();
        Certificacao existing = repo.porId(id, org)
                .orElseThrow(() -> new ResourceNotFoundException("Certificacao nao encontrada"));
        CertificacaoStatus status = ComplianceEnums.parseOrNull(CertificacaoStatus.class, cmd.status(), "status");
        Certificacao atualizado = new Certificacao(
                existing.id(),
                org,
                cmd.name(),
                cmd.tipo(),
                cmd.orgaoEmissor(),
                cmd.numero(),
                status == null ? existing.status() : status,
                cmd.emitidaEm(),
                cmd.validaAte(),
                cmd.productId(),
                cmd.productName(),
                cmd.categoria(),
                cmd.descricao(),
                cmd.paisEmissor(),
                cmd.paisDestino(),
                cmd.assinaturaDigital(),
                cmd.complianceStatus(),
                cmd.exportId(),
                cmd.dueNumber(),
                cmd.aiGenerated(),
                cmd.aiConfidenceScore(),
                cmd.aiRiskScore(),
                cmd.aiRiskLevel(),
                cmd.createdBy() == null ? existing.createdBy() : cmd.createdBy());
        Certificacao salvo = repo.salvar(atualizado);
        outbox.record("Certificacao", salvo.id().asString(), org, "CertificacaoAtualizada",
                ComplianceEnums.payload("certificacaoId", salvo.id().value(), org));
        return CertificacaoView.from(salvo);
    }

    @Override
    @Transactional
    public void excluir(UUID id) {
        UUID org = currentOrg();
        repo.remover(id, org);
        outbox.record("Certificacao", id.toString(), org, "CertificacaoExcluida",
                ComplianceEnums.payload("certificacaoId", id, org));
    }
}
