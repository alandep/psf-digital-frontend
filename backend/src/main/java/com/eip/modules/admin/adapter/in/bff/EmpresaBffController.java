package com.eip.modules.admin.adapter.in.bff;

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

import com.eip.modules.admin.domain.port.in.GerenciarEmpresasUseCase;
import com.eip.modules.admin.domain.port.in.GerenciarEmpresasUseCase.AtualizarEmpresaCommand;
import com.eip.modules.admin.domain.port.in.GerenciarEmpresasUseCase.CriarEmpresaCommand;
import com.eip.modules.admin.domain.port.in.GerenciarEmpresasUseCase.EmpresaView;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints for the admin "Gestão de Empresas" screen. Guards use the
 * {@code super-admin/empresas} screen id so access aligns with the existing
 * super-admin surface convention.
 */
@RestController
@RequestMapping("/bff/admin/empresas")
@RequiredArgsConstructor
public class EmpresaBffController {

    private final GerenciarEmpresasUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('super-admin/empresas','view')")
    public List<EmpresaView> listar() {
        return useCase.listar();
    }

    @PostMapping
    @PreAuthorize("@rbac.can('super-admin/empresas','create')")
    public EmpresaView criar(@RequestBody EmpresaRequest req) {
        return useCase.criar(new CriarEmpresaCommand(
                req.razaoSocial(), req.nomeFantasia(), req.cnpj(), req.tipo(), req.pais(),
                req.estado(), req.cidade(), req.responsavel(), req.email(), req.telefone(), req.plano()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rbac.can('super-admin/empresas','edit')")
    public EmpresaView atualizar(@PathVariable UUID id, @RequestBody EmpresaRequest req) {
        return useCase.atualizar(id, new AtualizarEmpresaCommand(
                req.razaoSocial(), req.nomeFantasia(), req.cnpj(), req.tipo(), req.pais(),
                req.estado(), req.cidade(), req.responsavel(), req.email(), req.telefone(), req.plano()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("@rbac.can('super-admin/empresas','edit')")
    public EmpresaView alterarStatus(@PathVariable UUID id, @RequestBody AlterarStatusRequest req) {
        return useCase.alterarStatus(id, req.status());
    }
}