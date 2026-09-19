package com.eip.modules.crm.adapter.in.bff;

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

import com.eip.modules.crm.domain.port.in.GerenciarOportunidadesUseCase;
import com.eip.modules.crm.domain.port.in.GerenciarOportunidadesUseCase.OportunidadeView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the CRM sales-pipeline screens.
 */
@RestController
@RequestMapping("/bff/crm/oportunidades")
@RequiredArgsConstructor
public class OportunidadeBffController {

    private final GerenciarOportunidadesUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('crm/oportunidades','view')")
    public List<OportunidadeView> listar(@RequestParam(required = false) String estagio) {
        return useCase.listar(estagio);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.can('crm/oportunidades','view')")
    public OportunidadeView porId(@PathVariable UUID id) {
        return useCase.porId(id);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('crm/oportunidades','create')")
    public OportunidadeView criar(@Valid @RequestBody CriarOportunidadeRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PostMapping("/{id}/avancar")
    @PreAuthorize("@rbac.can('crm/oportunidades','edit')")
    public OportunidadeView avancar(
            @PathVariable UUID id,
            @Valid @RequestBody AvancarOportunidadeRequest request) {
        return useCase.avancar(id, request.toCommand());
    }

    @PostMapping("/{id}/ganhar")
    @PreAuthorize("@rbac.can('crm/oportunidades','edit')")
    public OportunidadeView ganhar(@PathVariable UUID id) {
        return useCase.ganhar(id);
    }

    @PostMapping("/{id}/perder")
    @PreAuthorize("@rbac.can('crm/oportunidades','edit')")
    public OportunidadeView perder(@PathVariable UUID id) {
        return useCase.perder(id);
    }
}
