package com.eip.modules.export.domain.port.out;

import java.util.Optional;
import java.util.UUID;

import com.eip.modules.export.domain.model.Exportacao;

/**
 * Outbound port: persistence for the export aggregate.
 */
public interface ExportacaoRepositoryPort {

    Exportacao salvar(Exportacao e);

    Optional<Exportacao> porId(UUID id, UUID org);

    PageResult listar(UUID org, String status, int page, int size);
}
