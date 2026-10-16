package com.eip.modules.compliance.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Certification domain type. Mostly CRUD/read; modelled as an immutable record.
 */
public record Certificacao(
        CertificacaoId id,
        UUID organizationId,
        String name,
        String tipo,
        String orgaoEmissor,
        String numero,
        CertificacaoStatus status,
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

    /** Creates a new certification with a default status when none is given. */
    public static Certificacao nova(UUID org, String name, String tipo, String orgaoEmissor,
                                    String numero, CertificacaoStatus status, LocalDate emitidaEm,
                                    LocalDate validaAte, String productId, String productName,
                                    String categoria, String descricao, String paisEmissor,
                                    String paisDestino, boolean assinaturaDigital,
                                    String complianceStatus, String exportId, String dueNumber,
                                    boolean aiGenerated, BigDecimal aiConfidenceScore,
                                    BigDecimal aiRiskScore, String aiRiskLevel, String createdBy) {
        if (name == null || name.isBlank()) {
            throw new BusinessRuleException("Nome da certificacao e obrigatorio");
        }
        return new Certificacao(
                CertificacaoId.novo(),
                org,
                name,
                tipo,
                orgaoEmissor,
                numero,
                status == null ? CertificacaoStatus.ATIVA : status,
                emitidaEm,
                validaAte,
                productId,
                productName,
                categoria,
                descricao,
                paisEmissor,
                paisDestino,
                assinaturaDigital,
                complianceStatus,
                exportId,
                dueNumber,
                aiGenerated,
                aiConfidenceScore,
                aiRiskScore,
                aiRiskLevel,
                createdBy);
    }
}
