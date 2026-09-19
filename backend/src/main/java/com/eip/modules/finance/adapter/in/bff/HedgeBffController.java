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

import com.eip.modules.finance.domain.port.in.GerenciarHedgeUseCase;
import com.eip.modules.finance.domain.port.in.GerenciarHedgeUseCase.HedgeView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the hedge contract management screens.
 */
@RestController
@RequestMapping("/bff/financeiro/hedge")
@RequiredArgsConstructor
public class HedgeBffController {

    private final GerenciarHedgeUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('financeiro/hedge','view')")
    public List<HedgeView> listar(@RequestParam(required = false) String status) {
        return useCase.listar(status);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('financeiro/hedge','create')")
    public HedgeView criar(@Valid @RequestBody CriarHedgeRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PostMapping("/{id}/exercer")
    @PreAuthorize("@rbac.can('financeiro/hedge','edit')")
    public HedgeView exercer(@PathVariable UUID id) {
        return useCase.exercer(id);
    }

    @PostMapping("/{id}/expirar")
    @PreAuthorize("@rbac.can('financeiro/hedge','edit')")
    public HedgeView expirar(@PathVariable UUID id) {
        return useCase.expirar(id);
    }

    @PostMapping("/{id}/cancelar")
    @PreAuthorize("@rbac.can('financeiro/hedge','edit')")
    public HedgeView cancelar(@PathVariable UUID id) {
        return useCase.cancelar(id);
    }
}
