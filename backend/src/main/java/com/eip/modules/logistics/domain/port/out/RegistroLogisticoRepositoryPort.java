package com.eip.modules.logistics.domain.port.out;

import java.util.List;
import java.util.UUID;

/**
 * Outbound port: read access to the tenant-scoped logistics registries
 * (ports, carriers and vessels).
 */
public interface RegistroLogisticoRepositoryPort {

    List<PortoData> portos(UUID org);

    List<TransportadoraData> transportadoras(UUID org);

    List<NavioData> navios(UUID org);

    /** Raw port record. */
    record PortoData(UUID id, String code, String name, String country) {
    }

    /** Raw carrier record. */
    record TransportadoraData(UUID id, String name, String tipo) {
    }

    /** Raw vessel record. */
    record NavioData(UUID id, String name, String imo) {
    }
}
