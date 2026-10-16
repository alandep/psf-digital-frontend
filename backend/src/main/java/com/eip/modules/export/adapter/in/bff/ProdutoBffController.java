package com.eip.modules.export.adapter.in.bff;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.export.domain.port.in.ProdutoUseCase;
import com.eip.modules.export.domain.port.in.ProdutoUseCase.ProdutoView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** BFF endpoints for product listing and registration. */
@RestController
@RequestMapping("/bff/produtos")
@RequiredArgsConstructor
public class ProdutoBffController {

    private final ProdutoUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','view')")
    public List<ProdutoView> listar() {
        return useCase.listar();
    }

    @PostMapping
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','create')")
    public ProdutoView criar(@Valid @RequestBody CriarProdutoRequest request) {
        return useCase.criar(request.toCommand());
    }
}
