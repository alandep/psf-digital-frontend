package com.eip.modules.compliance.domain.model;

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
        LocalDate validaAte) {

    /** Creates a new certification with a default status when none is given. */
    public static Certificacao nova(UUID org, String name, String tipo, String orgaoEmissor,
                                    String numero, CertificacaoStatus status, LocalDate emitidaEm,
                                    LocalDate validaAte) {
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
                validaAte);
    }
}
