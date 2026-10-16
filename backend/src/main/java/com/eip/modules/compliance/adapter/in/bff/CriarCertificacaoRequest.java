package com.eip.modules.compliance.adapter.in.bff;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.eip.modules.compliance.domain.port.in.ConsultarCertificacoesUseCase.CriarCertificacaoCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating or updating a certification.
 */
public record CriarCertificacaoRequest(
        @NotBlank String name,
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
        String aiRiskLevel) {

    /** Maps this request to the use-case command, injecting the current user. */
    public CriarCertificacaoCommand toCommand(String createdBy) {
        return new CriarCertificacaoCommand(
                name,
                tipo,
                orgaoEmissor,
                numero,
                status,
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
