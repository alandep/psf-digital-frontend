package com.eip.modules.ai.application.reconciliation;

import com.eip.modules.ai.application.ReconciliationUseCaseService;
import com.eip.modules.ai.application.extraction.CommercialInvoiceDto;
import com.eip.modules.ai.application.extraction.PackingListDto;
import com.eip.modules.ai.application.extraction.PedidoDto;

/**
 * Resposta agregada e <strong>explícita</strong> do fluxo de reconciliação parcial.
 *
 * <p>Expõe o resultado por documento ({@code pedido}, {@code packing}, {@code invoice}) e
 * só carrega a reconciliação determinística quando os três foram extraídos com sucesso.
 * Invariantes do contrato:</p>
 *
 * <ul>
 *   <li>{@code allExtracted == true} ⟺ os três documentos têm {@code status == OK}.</li>
 *   <li>{@code reconciliation != null} ⟹ {@code allExtracted == true} — nunca uma
 *       reconciliação aparentemente válida com algum documento {@code FAILED}.</li>
 * </ul>
 *
 * <p>O segundo invariante é verificado na construção. O {@code review} descreve o
 * encaminhamento (determinístico) para revisão humana.</p>
 *
 * @param pedido         resultado da extração do pedido
 * @param packing        resultado da extração do packing list
 * @param invoice        resultado da extração da commercial invoice
 * @param allExtracted   {@code true} ⟺ os três documentos estão OK
 * @param reconciliation visão da reconciliação determinística; {@code null} quando {@code !allExtracted}
 * @param review         desfecho determinístico de revisão humana
 */
public record ReconciliationResponse(
        DocumentExtractionResult<PedidoDto> pedido,
        DocumentExtractionResult<PackingListDto> packing,
        DocumentExtractionResult<CommercialInvoiceDto> invoice,
        boolean allExtracted,
        ReconciliationUseCaseService.ReconciliationView reconciliation,
        ReviewOutcome review) {

    /**
     * Impõe o invariante {@code reconciliation != null ⟹ allExtracted == true}.
     */
    public ReconciliationResponse {
        if (reconciliation != null && !allExtracted) {
            throw new IllegalArgumentException(
                    "reconciliation só pode ser não-nula quando allExtracted == true");
        }
    }

    /**
     * Deriva {@code allExtracted} dos três resultados por documento.
     *
     * @param p resultado do pedido
     * @param k resultado do packing
     * @param i resultado da invoice
     * @return {@code true} ⟺ os três estão OK
     */
    public static boolean computeAllExtracted(DocumentExtractionResult<?> p, DocumentExtractionResult<?> k,
            DocumentExtractionResult<?> i) {
        return p.isOk() && k.isOk() && i.isOk();
    }
}
