package com.eip.modules.ai.application.reconciliation;

/**
 * Desfecho de revisão humana guiado por sinais determinísticos.
 *
 * <p>Invariante central: {@code needsReview} é verdadeiro se e somente se {@code reasons}
 * é não-vazio. O campo {@code signalSource} é sempre {@code "deterministic"} — este modelo
 * <strong>nunca</strong> carrega um campo numérico de confiança (não existe e não deve ser
 * introduzido um "confidence score"). A lista de motivos é defensivamente copiada e
 * imutável.</p>
 *
 * @param needsReview  {@code true} ⟺ {@code reasons} é não-vazio
 * @param reasons      sinais determinísticos que motivaram a revisão (imutável; vazio quando não há revisão)
 * @param signalSource origem do sinal — sempre {@code "deterministic"}
 */
public record ReviewOutcome(boolean needsReview, java.util.List<ReviewReason> reasons, String signalSource) {

    /** Copia defensivamente a lista de motivos, tolerando {@code null}. */
    public ReviewOutcome {
        reasons = reasons == null ? java.util.List.of() : java.util.List.copyOf(reasons);
    }

    /**
     * @return um desfecho sem revisão ({@code needsReview == false}, sem motivos),
     *         com {@code signalSource == "deterministic"}.
     */
    public static ReviewOutcome none() {
        return new ReviewOutcome(false, java.util.List.of(), "deterministic");
    }

    /**
     * Fabrica um desfecho a partir dos sinais determinísticos observados.
     *
     * @param reasons motivos determinísticos (pode ser {@code null} ou vazio)
     * @return desfecho com {@code needsReview} derivado de {@code reasons} não ser vazio
     *         e {@code signalSource == "deterministic"}
     */
    public static ReviewOutcome of(java.util.List<ReviewReason> reasons) {
        java.util.List<ReviewReason> r = reasons == null ? java.util.List.of() : java.util.List.copyOf(reasons);
        return new ReviewOutcome(!r.isEmpty(), r, "deterministic");
    }
}
