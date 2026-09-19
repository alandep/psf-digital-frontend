package com.eip.modules.crm.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.crm.domain.model.Oportunidade;

/**
 * Outbound port: persistence for the opportunity aggregate.
 */
public interface OportunidadeRepositoryPort {

    Oportunidade salvar(Oportunidade o);

    Optional<Oportunidade> porId(UUID id, UUID org);

    /** Lists opportunities, optionally filtered by stage (nullable). */
    List<Oportunidade> listar(UUID org, String estagio);
}
