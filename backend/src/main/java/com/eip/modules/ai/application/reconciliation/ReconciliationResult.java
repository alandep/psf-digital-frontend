package com.eip.modules.ai.application.reconciliation;

import java.util.List;

/**
 * Resultado da reconciliação determinística de documentos
 * (Pedido × Packing List × Commercial Invoice).
 *
 * <p>Invariante: {@code ok == divergences.isEmpty()}. O resultado é considerado
 * conforme ({@code ok() == true}) se e somente se nenhuma divergência foi detectada.
 *
 * @param ok           {@code true} quando não há divergências
 * @param divergences  lista imutável de divergências detectadas (ordem determinística)
 */
public record ReconciliationResult(boolean ok, List<Divergence> divergences) {

    /**
     * Cria um resultado a partir da lista de divergências, derivando {@code ok}
     * da ausência de divergências e copiando a lista para torná-la imutável.
     *
     * <p>Mantém a invariante {@code ok == divergences.isEmpty()}.
     *
     * @param divergences divergências detectadas (não nula)
     * @return resultado com {@code ok} derivado e lista imutável
     */
    public static ReconciliationResult of(List<Divergence> divergences) {
        return new ReconciliationResult(divergences.isEmpty(), List.copyOf(divergences));
    }
}
