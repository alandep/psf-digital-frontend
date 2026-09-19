package com.eip.modules.compliance.adapter.in.bff;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.compliance.domain.port.in.ConsultarEsgUseCase;
import com.eip.modules.compliance.domain.port.in.ConsultarEsgUseCase.EsgView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the ESG assessment screens.
 */
@RestController
@RequestMapping("/bff/compliance/esg")
@RequiredArgsConstructor
public class EsgBffController {

    private final ConsultarEsgUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('compliance/painel','view')")
    public List<EsgView> listar() {
        return useCase.listar();
    }

    @PostMapping
    @PreAuthorize("@rbac.can('compliance/painel','create')")
    public EsgView criar(@Valid @RequestBody CriarEsgRequest request) {
        return useCase.criar(request.toCommand());
    }
}
