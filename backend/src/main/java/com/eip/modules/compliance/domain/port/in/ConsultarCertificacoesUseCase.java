package com.eip.modules.compliance.domain.port.in;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.eip.modules.compliance.domain.model.Certificacao;

/**
 * Inbound port: consult, register, update and delete certifications.
 */
public interface ConsultarCertificacoesUseCase {

    List<CertificacaoView> listar(String status);

    CertificacaoView criar(CriarCertificacaoCommand cmd);

    CertificacaoView atualizar(UUID id, CriarCertificacaoCommand cmd);

    void excluir(UUID id);

    /** Command to create or update a certification. */
    record CriarCertificacaoCommand(
            String name,
            String tipo,
            String orgaoEmissor,
            String numero,
            String status,
            LocalDate emitidaEm,
            LocalDate validaAte,
            String productId,
            String productName,
            String categoria,
            String descricao,
            String paisEmissor,
            String paisDestino,
            boolean assinaturaDigital,
            String complianceStatus,
            String exportId,
            String dueNumber,
            boolean aiGenerated,
            BigDecimal aiConfidenceScore,
            BigDecimal aiRiskScore,
            String aiRiskLevel,
            String createdBy) {
    }

    /** Read view of a single certification. */
    record CertificacaoView(
            UUID id,
            String name,
            String tipo,
            String orgaoEmissor,
            String numero,
            String status,
            LocalDate emitidaEm,
            LocalDate validaAte,
            String productId,
            String productName,
            String categoria,
            String descricao,
            String paisEmissor,
            String paisDestino,
            boolean assinaturaDigital,
            String complianceStatus,
            String exportId,
            String dueNumber,
            boolean aiGenerated,
            BigDecimal aiConfidenceScore,
            BigDecimal aiRiskScore,
            String aiRiskLevel,
            String createdBy) {

        public static CertificacaoView from(Certificacao c) {
            return new CertificacaoView(
                    c.id().value(),
                    c.name(),
                    c.tipo(),
                    c.orgaoEmissor(),
                    c.numero(),
                    c.status().name(),
                    c.emitidaEm(),
                    c.validaAte(),
                    c.productId(),
                    c.productName(),
                    c.categoria(),
                    c.descricao(),
                    c.paisEmissor(),
                    c.paisDestino(),
                    c.assinaturaDigital(),
                    c.complianceStatus(),
                    c.exportId(),
                    c.dueNumber(),
                    c.aiGenerated(),
                    c.aiConfidenceScore(),
                    c.aiRiskScore(),
                    c.aiRiskLevel(),
                    c.createdBy());
        }
    }
}
