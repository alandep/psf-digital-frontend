package com.eip.modules.bi.adapter.in.bff;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.bi.domain.port.in.GerenciarDashboardsUseCase;
import com.eip.modules.bi.domain.port.in.GerenciarDashboardsUseCase.DashboardView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the dashboard management screens.
 */
@RestController
@RequestMapping("/bff/bi/dashboards")
@RequiredArgsConstructor
public class DashboardBffController {

    private final GerenciarDashboardsUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('dashboards/principal','view')")
    public List<DashboardView> listar() {
        return useCase.listar();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.can('dashboards/principal','view')")
    public DashboardView porId(@PathVariable UUID id) {
        return useCase.porId(id);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('dashboards/principal','create')")
    public DashboardView criar(@Valid @RequestBody CriarDashboardRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rbac.can('dashboards/principal','edit')")
    public DashboardView atualizar(@PathVariable UUID id,
                                   @Valid @RequestBody AtualizarDashboardRequest request) {
        return useCase.atualizar(id, request.toCommand());
    }

    @PostMapping("/{id}/padrao")
    @PreAuthorize("@rbac.can('dashboards/principal','edit')")
    public DashboardView definirPadrao(@PathVariable UUID id) {
        return useCase.definirPadrao(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@rbac.can('dashboards/principal','delete')")
    public void remover(@PathVariable UUID id) {
        useCase.remover(id);
    }
}
