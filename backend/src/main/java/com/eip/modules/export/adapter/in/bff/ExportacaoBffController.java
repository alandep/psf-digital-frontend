package com.eip.modules.export.adapter.in.bff;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.export.domain.port.in.ConfirmarExportacaoUseCase;
import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase;
import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase.ExportacaoView;
import com.eip.modules.export.domain.port.in.ListarExportacoesUseCase;
import com.eip.modules.export.domain.port.in.ListarExportacoesUseCase.ExportacoesPage;
import com.eip.platform.idempotency.IdempotencyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the export management screens.
 */
@RestController
@RequestMapping("/bff/exportacoes")
@RequiredArgsConstructor
public class ExportacaoBffController {

    private final CriarExportacaoUseCase criarUseCase;
    private final ConfirmarExportacaoUseCase confirmarUseCase;
    private final ListarExportacoesUseCase listarUseCase;
    private final IdempotencyService idempotencyService;

    @GetMapping
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','view')")
    public ExportacoesPage listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return listarUseCase.paraLista(page, size, status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','view')")
    public ExportacaoView porId(@PathVariable UUID id) {
        return listarUseCase.porId(id);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','create')")
    public ExportacaoView criar(
            @Valid @RequestBody CriarExportacaoRequest request,
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            return idempotencyService.execute(
                    "criarExportacao", idempotencyKey, request,
                    () -> criarUseCase.criar(request.toCommand()));
        }
        return criarUseCase.criar(request.toCommand());
    }

    @PostMapping("/{id}/confirmar")
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','edit')")
    public ExportacaoView confirmar(@PathVariable UUID id) {
        return confirmarUseCase.confirmar(id);
    }
}
