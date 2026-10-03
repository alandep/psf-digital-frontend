package com.eip.modules.ai.application.reconciliation;

import com.eip.modules.ai.application.extraction.CommercialInvoiceDto;
import com.eip.modules.ai.application.extraction.InvoiceLineDto;
import com.eip.modules.ai.application.extraction.PackingListDto;
import com.eip.modules.ai.application.extraction.PackingListLineDto;
import com.eip.modules.ai.application.extraction.PedidoDto;
import com.eip.modules.ai.application.extraction.PedidoLineDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

/**
 * Reconciliação determinística de documentos: compara Pedido × Packing List ×
 * Commercial Invoice em <strong>Java puro</strong>.
 *
 * <p><strong>A IA NÃO participa de nenhuma decisão de igualdade numérica</strong>
 * (Requirement 8.5). Toda comparação — moeda, Incoterm, quantidade por SKU e valor
 * total — é feita aqui com {@link BigDecimal} e tolerâncias absolutas fixas. A IA
 * só pode, em uma etapa posterior e separada (task 11.3), EXPLICAR divergências já
 * detectadas; ela nunca decide se dois valores são iguais.
 *
 * <p><strong>Property 3 — determinística e pura:</strong> {@link #reconcile} é uma
 * função pura das suas entradas. Não há chamadas externas, aleatoriedade, relógio
 * nem estado mutável compartilhado. Para o mesmo trio de documentos, o conjunto de
 * divergências produzido é sempre idêntico e na mesma ordem (os SKUs são iterados
 * em ordem determinística via {@link TreeSet}). Vale a invariante
 * {@code result.ok() == divergences.isEmpty()}.
 */
@Component
public class DocumentReconciliationService {

    /** Tolerância absoluta para comparação de quantidades por SKU. */
    private static final BigDecimal QUANTITY_TOLERANCE = new BigDecimal("0.001");

    /** Tolerância absoluta para comparação de valor total. */
    private static final BigDecimal TOTAL_TOLERANCE = new BigDecimal("0.01");

    /**
     * Reconcilia os três documentos de forma determinística e pura.
     *
     * <p>Comparações realizadas (todas em Java, sem IA):
     * <ul>
     *   <li><strong>Moeda:</strong> {@code pedido.currency()} vs {@code invoice.currency()}
     *       (case-insensitive, com trim).</li>
     *   <li><strong>Incoterm:</strong> {@code pedido.incoterm()} vs {@code invoice.incoterm()}
     *       (case-insensitive, com trim).</li>
     *   <li><strong>Quantidade por SKU:</strong> união dos SKUs dos três documentos; para
     *       cada SKU ausente em algum documento gera {@link Divergence#skuMissing}; quando
     *       presente em todos, as três quantidades devem ser iguais dentro de uma tolerância
     *       absoluta de {@value #QUANTITY_TOLERANCE}.</li>
     *   <li><strong>Total:</strong> {@code pedido.totalAmount()} vs {@code invoice.totalAmount()}
     *       dentro de uma tolerância absoluta de {@value #TOTAL_TOLERANCE}.</li>
     * </ul>
     *
     * @param pedido  pedido extraído (já validado por Bean Validation)
     * @param packing packing list extraído (já validado por Bean Validation)
     * @param invoice commercial invoice extraída (já validada por Bean Validation)
     * @return resultado com {@code ok() == divergências.isEmpty()}
     */
    public ReconciliationResult reconcile(PedidoDto pedido, PackingListDto packing, CommercialInvoiceDto invoice) {
        List<Divergence> divergences = new ArrayList<>();

        // Moeda: Pedido vs Invoice (case-insensitive, trim).
        if (!sameToken(pedido.currency(), invoice.currency())) {
            divergences.add(Divergence.currency(pedido.currency(), invoice.currency()));
        }

        // Incoterm: Pedido vs Invoice (case-insensitive, trim).
        if (!sameToken(pedido.incoterm(), invoice.incoterm())) {
            divergences.add(Divergence.incoterm(pedido.incoterm(), invoice.incoterm()));
        }

        // Quantidade por SKU: união em ordem determinística (TreeSet).
        Map<String, BigDecimal> qtyPedido = qtyBySkuPedido(pedido);
        Map<String, BigDecimal> qtyPacking = qtyBySkuPacking(packing);
        Map<String, BigDecimal> qtyInvoice = qtyBySkuInvoice(invoice);

        TreeSet<String> union = new TreeSet<>();
        union.addAll(qtyPedido.keySet());
        union.addAll(qtyPacking.keySet());
        union.addAll(qtyInvoice.keySet());

        for (String sku : union) {
            boolean inPedido = qtyPedido.containsKey(sku);
            boolean inPacking = qtyPacking.containsKey(sku);
            boolean inInvoice = qtyInvoice.containsKey(sku);

            if (!inPedido || !inPacking || !inInvoice) {
                divergences.add(Divergence.skuMissing(sku, missingIn(inPedido, inPacking, inInvoice)));
                continue;
            }

            BigDecimal qp = qtyPedido.get(sku);
            BigDecimal qk = qtyPacking.get(sku);
            BigDecimal qi = qtyInvoice.get(sku);
            if (!withinTolerance(qp, qk, qi, QUANTITY_TOLERANCE)) {
                divergences.add(Divergence.quantity(sku, qp, qk, qi));
            }
        }

        // Total: Pedido vs Invoice dentro da tolerância absoluta.
        if (!sameMoney(pedido.totalAmount(), invoice.totalAmount(), TOTAL_TOLERANCE)) {
            divergences.add(Divergence.total(pedido.totalAmount(), invoice.totalAmount()));
        }

        return ReconciliationResult.of(divergences);
    }

    /**
     * Compara dois identificadores textuais (moeda/Incoterm) de forma case-insensitive
     * com trim. {@code null} em ambos é considerado igual; {@code null} em apenas um é
     * considerado divergente.
     */
    private boolean sameToken(String a, String b) {
        String na = a == null ? null : a.trim();
        String nb = b == null ? null : b.trim();
        if (na == null || nb == null) {
            return na == nb;
        }
        return na.equalsIgnoreCase(nb);
    }

    /**
     * Verifica se três quantidades são iguais entre si dentro de uma tolerância absoluta.
     * Trata {@code null} defensivamente: um {@code null} só é "igual" a outro {@code null}.
     */
    private boolean withinTolerance(BigDecimal a, BigDecimal b, BigDecimal c, BigDecimal tol) {
        return sameMoney(a, b, tol) && sameMoney(b, c, tol) && sameMoney(a, c, tol);
    }

    /**
     * Verifica se dois valores são iguais dentro de uma tolerância absoluta
     * ({@code |a - b| <= tol}). Trata {@code null} defensivamente: {@code null} só é
     * "igual" a outro {@code null}.
     */
    private boolean sameMoney(BigDecimal a, BigDecimal b, BigDecimal tol) {
        if (a == null || b == null) {
            return a == b;
        }
        return a.subtract(b).abs().compareTo(tol) <= 0;
    }

    /** Mapa determinístico SKU → quantidade para o Pedido (preserva ordem de inserção). */
    private Map<String, BigDecimal> qtyBySkuPedido(PedidoDto pedido) {
        Map<String, BigDecimal> map = new LinkedHashMap<>();
        if (pedido != null && pedido.lines() != null) {
            for (PedidoLineDto line : pedido.lines()) {
                if (line != null && line.sku() != null) {
                    map.put(line.sku(), line.quantity());
                }
            }
        }
        return map;
    }

    /** Mapa determinístico SKU → quantidade para o Packing List. */
    private Map<String, BigDecimal> qtyBySkuPacking(PackingListDto packing) {
        Map<String, BigDecimal> map = new LinkedHashMap<>();
        if (packing != null && packing.lines() != null) {
            for (PackingListLineDto line : packing.lines()) {
                if (line != null && line.sku() != null) {
                    map.put(line.sku(), line.quantity());
                }
            }
        }
        return map;
    }

    /** Mapa determinístico SKU → quantidade para a Commercial Invoice. */
    private Map<String, BigDecimal> qtyBySkuInvoice(CommercialInvoiceDto invoice) {
        Map<String, BigDecimal> map = new LinkedHashMap<>();
        if (invoice != null && invoice.lines() != null) {
            for (InvoiceLineDto line : invoice.lines()) {
                if (line != null && line.sku() != null) {
                    map.put(line.sku(), line.quantity());
                }
            }
        }
        return map;
    }

    /** Descreve, de forma determinística, em quais documentos um SKU está ausente. */
    private String missingIn(boolean inPedido, boolean inPacking, boolean inInvoice) {
        List<String> missing = new ArrayList<>();
        if (!inPedido) {
            missing.add("pedido");
        }
        if (!inPacking) {
            missing.add("packing");
        }
        if (!inInvoice) {
            missing.add("invoice");
        }
        return String.join(", ", missing);
    }
}
