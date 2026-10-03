package com.eip.modules.ai.application.reconciliation;

/**
 * Tipo do documento no fluxo de reconciliação.
 *
 * <ul>
 *   <li>{@link #PEDIDO} — ordem de compra.</li>
 *   <li>{@link #PACKING} — packing list.</li>
 *   <li>{@link #INVOICE} — commercial invoice.</li>
 * </ul>
 */
public enum DocKind {
    PEDIDO,
    PACKING,
    INVOICE
}
