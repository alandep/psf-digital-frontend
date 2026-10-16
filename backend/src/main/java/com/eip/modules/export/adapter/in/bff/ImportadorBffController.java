package com.eip.modules.export.adapter.in.bff;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.export.domain.port.in.ClienteUseCase;
import com.eip.modules.export.domain.port.in.ClienteUseCase.ClienteView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** BFF endpoints for importer (cliente) listing and registration. */
@RestController
@RequestMapping("/bff/importadores")
@RequiredArgsConstructor
public class ImportadorBffController {

    private final ClienteUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','view')")
    public List<ClienteView> listar() {
        return useCase.listar();
    }

    @PostMapping
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','create')")
    public ClienteView criar(@Valid @RequestBody CriarClienteRequest request) {
        return useCase.criar(request.toCommand());
    }
}
