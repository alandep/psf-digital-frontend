package com.eip.modules.admin.adapter.in.bff;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.admin.domain.port.in.GerenciarUsuariosUseCase;
import com.eip.modules.admin.domain.port.in.GerenciarUsuariosUseCase.AtualizarUsuarioCommand;
import com.eip.modules.admin.domain.port.in.GerenciarUsuariosUseCase.CriarUsuarioCommand;
import com.eip.modules.admin.domain.port.in.GerenciarUsuariosUseCase.UserMetrics;
import com.eip.modules.admin.domain.port.in.GerenciarUsuariosUseCase.UsuarioView;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints for the admin "Gestao de Usuarios" screen. All operations are
 * tenant-scoped to the CURRENT organization (session + the service reads the
 * org context). Guards use the {@code admin/usuarios} screen id.
 */
@RestController
@RequestMapping("/bff/admin/usuarios")
@RequiredArgsConstructor
public class UsuarioBffController {

    private final GerenciarUsuariosUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('admin/usuarios','view')")
    public List<UsuarioView> listar() {
        return useCase.listar();
    }

    @GetMapping("/metricas")
    @PreAuthorize("@rbac.can('admin/usuarios','view')")
    public UserMetrics metricas() {
        return useCase.metricas();
    }

    @PostMapping
    @PreAuthorize("@rbac.can('admin/usuarios','create')")
    public UsuarioView criar(@RequestBody UsuarioRequest req) {
        return useCase.criar(toCreate(req));
    }

    @PostMapping("/importar")
    @PreAuthorize("@rbac.can('admin/usuarios','create')")
    public List<UsuarioView> importar(@RequestBody ImportarUsuariosRequest req) {
        List<CriarUsuarioCommand> commands = new ArrayList<>();
        if (req.usuarios() != null) {
            for (UsuarioRequest u : req.usuarios()) {
                commands.add(toCreate(u));
            }
        }
        return useCase.importar(commands);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rbac.can('admin/usuarios','edit')")
    public UsuarioView atualizar(@PathVariable UUID id, @RequestBody UsuarioRequest req) {
        return useCase.atualizar(id, new AtualizarUsuarioCommand(
                req.name(), req.email(), req.role(), req.status(),
                req.departamento(), req.phone(), req.mfaEnabled()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("@rbac.can('admin/usuarios','edit')")
    public UsuarioView alterarStatus(@PathVariable UUID id, @RequestBody UsuarioStatusRequest req) {
        return useCase.alterarStatus(id, req.status());
    }

    @PostMapping("/{id}/reset-senha")
    @PreAuthorize("@rbac.can('admin/usuarios','edit')")
    public Map<String, Boolean> resetarSenha(@PathVariable UUID id) {
        return Map.of("ok", useCase.resetarSenha(id));
    }

    private static CriarUsuarioCommand toCreate(UsuarioRequest req) {
        return new CriarUsuarioCommand(
                req.name(), req.email(), req.role(),
                req.departamento(), req.phone(), req.mfaEnabled());
    }
}