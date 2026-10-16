package com.eip.modules.export.domain.port.in;

import java.util.List;
import java.util.UUID;

/** Inbound port: list and register importers (clientes). */
public interface ClienteUseCase {

    List<ClienteView> listar();

    ClienteView criar(CriarClienteCommand cmd);

    /** Command to register a new importer. */
    record CriarClienteCommand(String name, String country, String document,
                               String address, String contact) {
    }

    /** Read view of an importer. */
    record ClienteView(UUID id, String name, String country, String document,
                       String address, String contact) {
    }
}
