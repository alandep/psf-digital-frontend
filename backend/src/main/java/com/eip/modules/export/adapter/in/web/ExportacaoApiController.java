package com.eip.modules.export.adapter.in.web;

import java.net.URI;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.export.adapter.in.bff.CriarExportacaoRequest;
import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase;
import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase.ExportacaoView;
import com.eip.modules.export.domain.port.in.ListarExportacoesUseCase;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Public REST API for exports, secured by OAuth2 scopes.
 */
@RestController
@RequestMapping("/api/v1/exportacoes")
@RequiredArgsConstructor
public class ExportacaoApiController {

    private final CriarExportacaoUseCase criarUseCase;
    private final ListarExportacoesUseCase listarUseCase;

    @PostMapping
    @PreAuthorize("hasAuthority('SCOPE_exportacoes:write')")
    public ResponseEntity<ExportacaoView> criar(@Valid @RequestBody CriarExportacaoRequest request) {
        ExportacaoView view = criarUseCase.criar(request.toCommand());
        URI location = URI.create("/api/v1/exportacoes/" + view.id());
        return ResponseEntity.created(location).body(view);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_exportacoes:read')")
    public ExportacaoView porId(@PathVariable UUID id) {
        return listarUseCase.porId(id);
    }
}
