package com.eip.modules.reference.adapter.in.bff;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.reference.domain.port.in.ConsultarPaisesUseCase;
import com.eip.modules.reference.domain.port.in.ConsultarPaisesUseCase.PaisView;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoint exposing the global country reference list for reusable combos.
 * No {@code @PreAuthorize}: countries are generic reference data needed by many
 * screens. The BFF security chain already requires authentication for all
 * {@code /bff/**} endpoints, so any logged-in user may read this list.
 */
@RestController
@RequestMapping("/bff/paises")
@RequiredArgsConstructor
public class PaisBffController {

    private final ConsultarPaisesUseCase useCase;

    @GetMapping
    public List<PaisView> listar() {
        return useCase.listar();
    }
}
