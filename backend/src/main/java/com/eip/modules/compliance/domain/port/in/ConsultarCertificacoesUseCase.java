package com.eip.modules.compliance.domain.port.in;

import java.time.LocalDate;
import java.util.List;

import com.eip.modules.compliance.domain.model.Certificacao;

/**
 * Inbound port: consult and register certifications.
 */
public interface ConsultarCertificacoesUseCase {

    List<CertificacaoView> listar(String status);

    CertificacaoView criar(CriarCertificacaoCommand cmd);

    /** Command to create a certification. */
    record CriarCertificacaoCommand(
            String name,
            String tipo,
            String orgaoEmissor,
            String numero,
            String status,
            LocalDate emitidaEm,
            LocalDate validaAte) {
    }

    /** Read view of a single certification. */
    record CertificacaoView(
            java.util.UUID id,
            String name,
            String tipo,
            String orgaoEmissor,
            String numero,
            String status,
            LocalDate emitidaEm,
            LocalDate validaAte) {

        public static CertificacaoView from(Certificacao c) {
            return new CertificacaoView(
                    c.id().value(),
                    c.name(),
                    c.tipo(),
                    c.orgaoEmissor(),
                    c.numero(),
                    c.status().name(),
                    c.emitidaEm(),
                    c.validaAte());
        }
    }
}
