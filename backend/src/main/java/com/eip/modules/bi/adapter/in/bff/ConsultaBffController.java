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

import com.eip.modules.bi.domain.port.in.GerenciarConsultasUseCase;
import com.eip.modules.bi.domain.port.in.GerenciarConsultasUseCase.SavedQueryView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the data-explorer saved-query screens.
 */
@RestController
@RequestMapping("/bff/bi/consultas")
@RequiredArgsConstructor
public class ConsultaBffController {

    private final GerenciarConsultasUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('analytics/data-explorer','view')")
    public List<SavedQueryView> listar() {
        return useCase.listar();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.can('analytics/data-explorer','view')")
    public SavedQueryView porId(@PathVariable UUID id) {
        return useCase.porId(id);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('analytics/data-explorer','create')")
    public SavedQueryView criar(@Valid @RequestBody CriarConsultaRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rbac.can('analytics/data-explorer','edit')")
    public SavedQueryView atualizar(@PathVariable UUID id,
                                    @Valid @RequestBody AtualizarConsultaRequest request) {
        return useCase.atualizar(id, request.toCommand());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@rbac.can('analytics/data-explorer','delete')")
    public void remover(@PathVariable UUID id) {
        useCase.remover(id);
    }
}
