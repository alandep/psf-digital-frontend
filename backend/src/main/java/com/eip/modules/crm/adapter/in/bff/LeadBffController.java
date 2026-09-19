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

import com.eip.modules.crm.domain.port.in.GerenciarLeadsUseCase;
import com.eip.modules.crm.domain.port.in.GerenciarLeadsUseCase.FunilView;
import com.eip.modules.crm.domain.port.in.GerenciarLeadsUseCase.LeadView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the CRM leads and conversion-funnel screens.
 */
@RestController
@RequestMapping("/bff/crm/leads")
@RequiredArgsConstructor
public class LeadBffController {

    private final GerenciarLeadsUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('crm/leads','view')")
    public List<LeadView> listar(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String source) {
        return useCase.listar(status, source);
    }

    @GetMapping("/funil")
    @PreAuthorize("@rbac.can('crm/leads','view')")
    public FunilView funil() {
        return useCase.funil();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.can('crm/leads','view')")
    public LeadView porId(@PathVariable UUID id) {
        return useCase.porId(id);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('crm/leads','create')")
    public LeadView criar(@Valid @RequestBody CriarLeadRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("@rbac.can('crm/leads','edit')")
    public LeadView atualizarStatus(
            @PathVariable UUID id,
            @Valid @RequestBody AtualizarLeadStatusRequest request) {
        return useCase.atualizarStatus(id, request.toCommand());
    }
}
