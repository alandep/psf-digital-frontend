package com.eip.modules.logistics.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.logistics.domain.port.out.RegistroLogisticoRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link RegistroLogisticoRepositoryPort}
 * over the tenant-scoped registry tables.
 */
@Component
@RequiredArgsConstructor
public class RegistroLogisticoJpaAdapter implements RegistroLogisticoRepositoryPort {

    private final PortoJpaRepository portoJpa;
    private final TransportadoraJpaRepository transportadoraJpa;
    private final NavioJpaRepository navioJpa;

    @Override
    public List<PortoData> portos(UUID org) {
        return portoJpa.findByOrganizationId(org).stream()
                .map(p -> new PortoData(p.getId(), p.getCode(), p.getName(), p.getCountry()))
                .toList();
    }

    @Override
    public List<TransportadoraData> transportadoras(UUID org) {
        return transportadoraJpa.findByOrganizationId(org).stream()
                .map(t -> new TransportadoraData(t.getId(), t.getName(), t.getTipo()))
                .toList();
    }

    @Override
    public List<NavioData> navios(UUID org) {
        return navioJpa.findByOrganizationId(org).stream()
                .map(n -> new NavioData(n.getId(), n.getName(), n.getImo()))
                .toList();
    }
}
