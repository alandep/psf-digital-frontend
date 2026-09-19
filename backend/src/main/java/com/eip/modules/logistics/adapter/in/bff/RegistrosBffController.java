package com.eip.modules.logistics.adapter.in.bff;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.logistics.domain.port.in.RegistrosLogisticosUseCase;
import com.eip.modules.logistics.domain.port.in.RegistrosLogisticosUseCase.NavioView;
import com.eip.modules.logistics.domain.port.in.RegistrosLogisticosUseCase.PortoView;
import com.eip.modules.logistics.domain.port.in.RegistrosLogisticosUseCase.TransportadoraView;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints exposing the logistics registries (ports, carriers, vessels).
 */
@RestController
@RequestMapping("/bff/logistica")
@RequiredArgsConstructor
public class RegistrosBffController {

    private final RegistrosLogisticosUseCase useCase;

    @GetMapping("/portos")
    @PreAuthorize("@rbac.can('logistica/embarque','view')")
    public List<PortoView> portos() {
        return useCase.portos();
    }

    @GetMapping("/transportadoras")
    @PreAuthorize("@rbac.can('logistica/embarque','view')")
    public List<TransportadoraView> transportadoras() {
        return useCase.transportadoras();
    }

    @GetMapping("/navios")
    @PreAuthorize("@rbac.can('logistica/embarque','view')")
    public List<NavioView> navios() {
        return useCase.navios();
    }
}
