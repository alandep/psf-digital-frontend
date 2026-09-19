package com.eip.modules.cms.adapter.in.bff;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.cms.domain.port.in.GerenciarPerfisAcessoUseCase;
import com.eip.modules.cms.domain.port.in.GerenciarPerfisAcessoUseCase.PerfilView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Admin BFF endpoints backing the access-profile screens.
 */
@RestController
@RequestMapping("/bff/admin/perfis-acesso")
@RequiredArgsConstructor
public class PerfisAcessoBffController {

    private final GerenciarPerfisAcessoUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('admin/perfis-acesso','view')")
    public List<PerfilView> listar() {
        return useCase.listar();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.can('admin/perfis-acesso','view')")
    public PerfilView porId(@PathVariable UUID id) {
        return useCase.porId(id);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('admin/perfis-acesso','create')")
    public PerfilView criar(@Valid @RequestBody CriarPerfilRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rbac.can('admin/perfis-acesso','edit')")
    public PerfilView atualizar(@PathVariable UUID id,
                                @Valid @RequestBody AtualizarPerfilRequest request) {
        return useCase.atualizar(id, request.toCommand());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@rbac.can('admin/perfis-acesso','delete')")
    public void remover(@PathVariable UUID id) {
        useCase.remover(id);
    }
}
