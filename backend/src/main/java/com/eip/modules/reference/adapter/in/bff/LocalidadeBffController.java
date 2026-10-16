package com.eip.modules.reference.adapter.in.bff;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.reference.domain.port.in.ConsultarLocalidadesUseCase;
import com.eip.modules.reference.domain.port.in.ConsultarLocalidadesUseCase.CidadeView;
import com.eip.modules.reference.domain.port.in.ConsultarLocalidadesUseCase.EstadoView;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints exposing Brazilian state/city reference data for reusable
 * combos. No {@code @PreAuthorize}: generic reference data; the BFF security
 * chain already requires authentication for all {@code /bff/**} endpoints.
 */
@RestController
@RequiredArgsConstructor
public class LocalidadeBffController {

    private final ConsultarLocalidadesUseCase useCase;

    @GetMapping("/bff/estados")
    public List<EstadoView> estados() {
        return useCase.listarEstados();
    }

    @GetMapping("/bff/cidades")
    public List<CidadeView> cidades(@RequestParam("uf") String uf) {
        return useCase.listarCidadesPorUf(uf);
    }
}
