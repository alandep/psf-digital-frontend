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

import com.eip.modules.crm.domain.port.in.GerenciarClientesUseCase;
import com.eip.modules.crm.domain.port.in.GerenciarClientesUseCase.ClienteView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the CRM customers screens.
 */
@RestController
@RequestMapping("/bff/crm/clientes")
@RequiredArgsConstructor
public class ClienteBffController {

    private final GerenciarClientesUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('crm/clientes','view')")
    public List<ClienteView> listar(@RequestParam(required = false) String status) {
        return useCase.listar(status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.can('crm/clientes','view')")
    public ClienteView porId(@PathVariable UUID id) {
        return useCase.porId(id);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('crm/clientes','create')")
    public ClienteView criar(@Valid @RequestBody CriarClienteRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PostMapping("/{id}/ativar")
    @PreAuthorize("@rbac.can('crm/clientes','edit')")
    public ClienteView ativar(@PathVariable UUID id) {
        return useCase.ativar(id);
    }

    @PostMapping("/{id}/inativar")
    @PreAuthorize("@rbac.can('crm/clientes','edit')")
    public ClienteView inativar(@PathVariable UUID id) {
        return useCase.inativar(id);
    }
}
