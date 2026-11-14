package com.eip.modules.finance.adapter.in.bff;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.finance.domain.port.in.GerenciarPagamentosUseCase;
import com.eip.modules.finance.domain.port.in.GerenciarPagamentosUseCase.PagamentoView;
import com.eip.modules.finance.domain.port.in.GerenciarPagamentosUseCase.ResumoFinanceiro;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the payments management screens.
 */
@RestController
@RequestMapping("/bff/financeiro/pagamentos")
@RequiredArgsConstructor
public class PagamentoBffController {

    private final GerenciarPagamentosUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('financeiro/pagamentos','view')")
    public List<PagamentoView> listar(@RequestParam(required = false) String status,
                                      @RequestParam(required = false) String tipo) {
        return useCase.listar(status, tipo);
    }

    @GetMapping("/resumo")
    @PreAuthorize("@rbac.can('financeiro/pagamentos','view')")
    public ResumoFinanceiro resumo(@RequestParam(required = false) String tipo) {
        return useCase.resumo(tipo);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.can('financeiro/pagamentos','view')")
    public PagamentoView porId(@PathVariable UUID id) {
        return useCase.porId(id);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('financeiro/pagamentos','create')")
    public PagamentoView criar(@RequestBody CriarPagamentoRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rbac.can('financeiro/pagamentos','edit')")
    public PagamentoView atualizar(@PathVariable UUID id,
                                   @RequestBody CriarPagamentoRequest request) {
        return useCase.atualizar(id, request.toCommand());
    }

    @PostMapping("/{id}/pagar")
    @PreAuthorize("@rbac.can('financeiro/pagamentos','edit')")
    public PagamentoView pagar(@PathVariable UUID id,
                               @RequestBody(required = false) PagarRequest request) {
        return useCase.marcarPago(id, request == null ? null : request.paidAt());
    }

    @PostMapping("/{id}/cancelar")
    @PreAuthorize("@rbac.can('financeiro/pagamentos','edit')")
    public PagamentoView cancelar(@PathVariable UUID id) {
        return useCase.cancelar(id);
    }
}
