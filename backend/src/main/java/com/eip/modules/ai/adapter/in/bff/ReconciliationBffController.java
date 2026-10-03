package com.eip.modules.ai.adapter.in.bff;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.ai.application.ReconciliationUseCaseService;
import com.eip.modules.ai.application.reconciliation.ReconciliationResponse;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

/**
 * Endpoint BFF que exercita o fluxo de reconciliação
 * <strong>Pedido × Packing List × Commercial Invoice</strong> de ponta a ponta.
 *
 * <p>Delega ao {@link ReconciliationUseCaseService}: a IA extrai os três
 * documentos e explica divergências, enquanto a decisão de igualdade numérica é
 * 100% Java. A exaustão de franquia aflora como HTTP 402 via o
 * {@link com.eip.modules.ai.application.AiExceptionHandler}.
 *
 * <p>A resposta é o contrato explícito {@link ReconciliationResponse}, que
 * reporta o desfecho por documento (OK/FAILED para pedido, packing e invoice),
 * o flag {@code allExtracted}, a {@code reconciliation} determinística (presente
 * apenas quando os três documentos foram extraídos) e o {@code review} com os
 * motivos determinísticos que exigem revisão humana.
 */
@RestController
@RequestMapping("/bff/ai")
@RequiredArgsConstructor
public class ReconciliationBffController {

    private final ReconciliationUseCaseService service;

    @PostMapping("/reconciliar")
    @PreAuthorize("@rbac.can('ai-operations/painel','create')")
    public ReconciliationResponse reconciliar(@RequestBody @Valid ReconcileRequest req) {
        return service.reconcile(req.pedido(), req.packing(), req.invoice());
    }

    /** Requisição de reconciliação com os textos brutos dos três documentos. */
    public record ReconcileRequest(
            @NotBlank String pedido,
            @NotBlank String packing,
            @NotBlank String invoice) {
    }
}
