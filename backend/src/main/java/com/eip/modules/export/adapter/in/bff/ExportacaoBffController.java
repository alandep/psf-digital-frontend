package com.eip.modules.export.adapter.in.bff;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.export.domain.port.in.AtualizarExportacaoUseCase;
import com.eip.modules.export.domain.port.in.CancelarExportacaoUseCase;
import com.eip.modules.export.domain.port.in.ConfirmarExportacaoUseCase;
import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase;
import com.eip.modules.export.domain.port.in.CriarExportacaoUseCase.ExportacaoView;
import com.eip.modules.export.domain.port.in.ListarExportacoesUseCase;
import com.eip.modules.export.domain.port.in.ListarExportacoesUseCase.ExportacoesDashboard;
import com.eip.modules.export.domain.port.in.ListarExportacoesUseCase.ExportacoesPage;
import com.eip.modules.export.domain.port.in.MarcarEmbarqueUseCase;
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
    private final MarcarEmbarqueUseCase marcarEmbarqueUseCase;
    private final AtualizarExportacaoUseCase atualizarUseCase;
    private final CancelarExportacaoUseCase cancelarUseCase;
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

    /**
     * Dashboard agregado legado das exportações.
     *
     * @deprecated Substituído pelo dashboard rico
     *             {@code GET /bff/dashboards/principal}
     *             ({@code DashboardBffController}). Mantido por
     *             compatibilidade; a implementação subjacente
     *             ({@code ExportacaoService#dashboard()}) foi corrigida para usar
     *             agregação pushdown no banco e não carrega mais até 10.000
     *             linhas de exportação em memória.
     */
    @Deprecated
    @GetMapping("/dashboard")
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','view')")
    public ExportacoesDashboard dashboard() {
        return listarUseCase.dashboard();
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

    @PutMapping("/{id}")
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','edit')")
    public ExportacaoView atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody AtualizarExportacaoRequest request) {
        return atualizarUseCase.atualizar(id, request.toCommand());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','edit')")
    public void cancelar(@PathVariable UUID id) {
        cancelarUseCase.cancelar(id);
    }

    /**
     * Marca uma exportação como embarcada (idempotente no domínio). Aceita o
     * header {@code Idempotency-Key} para dedupe no nível de requisição,
     * reusando o mesmo padrão do {@code criar}. Conflitos de concorrência
     * ({@code ConcurrentModificationConflictException} lançada pelo
     * {@code ExportacaoJpaAdapter} no optimistic locking) são traduzidos para
     * HTTP 409 pelo {@code GlobalExceptionHandler} global — nenhum try/catch é
     * necessário aqui.
     */
    @PostMapping("/{id}/embarcar")
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','edit')")
    public ExportacaoView embarcar(
            @PathVariable UUID id,
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            return idempotencyService.execute(
                    "marcarEmbarque", idempotencyKey, id,
                    () -> marcarEmbarqueUseCase.marcarEmbarcado(id, OffsetDateTime.now()));
        }
        return marcarEmbarqueUseCase.marcarEmbarcado(id, OffsetDateTime.now());
    }
}
