package com.eip.modules.logistics.domain.port.in;

import java.util.List;
import java.util.UUID;

/**
 * Inbound port: read-only queries over the logistics registries
 * (ports, carriers and vessels).
 */
public interface RegistrosLogisticosUseCase {

    List<PortoView> portos();

    List<TransportadoraView> transportadoras();

    List<NavioView> navios();

    /** Read view of a port. */
    record PortoView(UUID id, String code, String name, String country) {
    }

    /** Read view of a carrier. */
    record TransportadoraView(UUID id, String name, String tipo) {
    }

    /** Read view of a vessel. */
    record NavioView(UUID id, String name, String imo) {
    }
}
