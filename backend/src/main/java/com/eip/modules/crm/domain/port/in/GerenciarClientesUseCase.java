package com.eip.modules.crm.domain.port.in;

import java.util.List;
import java.util.UUID;

import com.eip.modules.crm.domain.model.Cliente;

/**
 * Inbound port: manage CRM customers.
 */
public interface GerenciarClientesUseCase {

    List<ClienteView> listar(String status);

    ClienteView porId(UUID id);

    ClienteView criar(CriarClienteCommand cmd);

    ClienteView ativar(UUID id);

    ClienteView inativar(UUID id);

    /** Command to create a customer. */
    record CriarClienteCommand(
            String name,
            String cnpj,
            String segmento,
            String pais) {
    }

    /** Read view of a single customer. */
    record ClienteView(
            UUID id,
            String name,
            String cnpj,
            String segmento,
            String pais,
            String status) {

        public static ClienteView from(Cliente c) {
            return new ClienteView(
                    c.id().value(),
                    c.name(),
                    c.cnpj(),
                    c.segmento(),
                    c.pais(),
                    c.status().name());
        }
    }
}
