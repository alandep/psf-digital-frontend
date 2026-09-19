package com.eip.modules.finance.adapter.in.bff;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.finance.domain.port.in.GerenciarCambioUseCase;
import com.eip.modules.finance.domain.port.in.GerenciarCambioUseCase.CambioView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the FX contract management screens.
 */
@RestController
@RequestMapping("/bff/financeiro/cambio")
@RequiredArgsConstructor
public class CambioBffController {

    private final GerenciarCambioUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('financeiro/cambio','view')")
    public List<CambioView> listar(@RequestParam(required = false) String status) {
        return useCase.listar(status);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('financeiro/cambio','create')")
    public CambioView criar(@Valid @RequestBody CriarCambioRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PostMapping("/{id}/liquidar")
    @PreAuthorize("@rbac.can('financeiro/cambio','edit')")
    public CambioView liquidar(@PathVariable UUID id) {
        return useCase.liquidar(id);
    }

    @PostMapping("/{id}/cancelar")
    @PreAuthorize("@rbac.can('financeiro/cambio','edit')")
    public CambioView cancelar(@PathVariable UUID id) {
        return useCase.cancelar(id);
    }
}
