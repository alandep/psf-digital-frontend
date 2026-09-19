package com.eip.modules.compliance.domain.port.out;

import java.util.List;
import java.util.UUID;

import com.eip.modules.compliance.domain.model.EsgAvaliacao;

/**
 * Outbound port: persistence for ESG assessments.
 */
public interface EsgRepositoryPort {

    EsgAvaliacao salvar(EsgAvaliacao e);

    List<EsgAvaliacao> listar(UUID org);
}
