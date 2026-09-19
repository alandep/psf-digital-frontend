package com.eip.modules.crm.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.crm.domain.model.Cliente;

/**
 * Outbound port: persistence for the CRM customer aggregate.
 */
public interface ClienteRepositoryPort {

    Cliente salvar(Cliente c);

    Optional<Cliente> porId(UUID id, UUID org);

    /** Lists customers, optionally filtered by status (nullable). */
    List<Cliente> listar(UUID org, String status);
}
