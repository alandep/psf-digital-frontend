package com.eip.modules.ai.application.reconciliation;

/**
 * Sinais determinísticos que encaminham um resultado de reconciliação para revisão humana.
 *
 * <p>O encaminhamento para revisão é dirigido exclusivamente por estes sinais
 * determinísticos — <strong>nunca</strong> por um score de confiança fabricado. Cada
 * constante corresponde a uma condição observável e verificável no fluxo.</p>
 *
 * <ul>
 *   <li>{@link #FINISH_REASON_NOT_STOP} — a resposta do provedor terminou com
 *       {@code finishReason != STOP} (truncada ou bloqueada por segurança).</li>
 *   <li>{@link #REVALIDATION_FAILED} — o DTO passou no schema mas falhou numa regra de
 *       negócio determinística na re-validação.</li>
 *   <li>{@link #RECONCILIATION_DIVERGENCE} — a reconciliação determinística acusou
 *       divergência ({@code ReconciliationResult.ok() == false}).</li>
 *   <li>{@link #PARTIAL_EXTRACTION} — ao menos um documento ficou com status
 *       {@code FAILED} na extração.</li>
 * </ul>
 */
public enum ReviewReason {
    FINISH_REASON_NOT_STOP,
    REVALIDATION_FAILED,
    RECONCILIATION_DIVERGENCE,
    PARTIAL_EXTRACTION
}
