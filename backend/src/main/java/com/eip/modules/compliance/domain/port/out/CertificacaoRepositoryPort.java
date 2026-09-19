package com.eip.modules.compliance.domain.port.out;

import java.util.List;
import java.util.UUID;

import com.eip.modules.compliance.domain.model.Certificacao;

/**
 * Outbound port: persistence for certifications.
 */
public interface CertificacaoRepositoryPort {

    Certificacao salvar(Certificacao c);

    List<Certificacao> listar(UUID org, String status);
}
