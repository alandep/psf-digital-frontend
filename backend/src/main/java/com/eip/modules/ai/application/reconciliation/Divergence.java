package com.eip.modules.ai.application.reconciliation;

import java.math.BigDecimal;

/**
 * Descreve uma única discrepância detectada entre os documentos
 * (Pedido × Packing List × Commercial Invoice) durante a reconciliação.
 *
 * <p>Cada fábrica estática constrói um {@code detail} legível por humanos de forma
 * <strong>determinística</strong>: o texto depende apenas dos argumentos recebidos,
 * sem timestamps, aleatoriedade ou qualquer dependência de estado externo. Isso
 * garante que o mesmo conjunto de entradas sempre produza a mesma {@code Divergence}
 * (Property 3 — reconciliação determinística e pura).
 *
 * @param type   categoria da divergência
 * @param field  campo/dimensão comparado (ex.: {@code "currency"}, {@code "SKU-123"})
 * @param detail descrição legível da discrepância
 */
public record Divergence(DivergenceType type, String field, String detail) {

    /** Categorias de divergência suportadas pela reconciliação determinística. */
    public enum DivergenceType {
        CURRENCY,
        INCOTERM,
        QUANTITY,
        TOTAL,
        SKU_MISSING
    }

    /**
     * Divergência de moeda entre Pedido e Commercial Invoice.
     *
     * @param expected moeda esperada (Pedido)
     * @param actual   moeda encontrada (Invoice)
     */
    public static Divergence currency(String expected, String actual) {
        return new Divergence(
                DivergenceType.CURRENCY,
                "currency",
                "Moeda divergente: pedido=" + expected + ", invoice=" + actual);
    }

    /**
     * Divergência de Incoterm entre Pedido e Commercial Invoice.
     *
     * @param expected Incoterm esperado (Pedido)
     * @param actual   Incoterm encontrado (Invoice)
     */
    public static Divergence incoterm(String expected, String actual) {
        return new Divergence(
                DivergenceType.INCOTERM,
                "incoterm",
                "Incoterm divergente: pedido=" + expected + ", invoice=" + actual);
    }

    /**
     * Divergência de quantidade de um SKU entre os três documentos.
     *
     * @param sku     SKU avaliado
     * @param pedido  quantidade no Pedido
     * @param packing quantidade no Packing List
     * @param invoice quantidade na Commercial Invoice
     */
    public static Divergence quantity(String sku, BigDecimal pedido, BigDecimal packing, BigDecimal invoice) {
        return new Divergence(
                DivergenceType.QUANTITY,
                sku,
                "Quantidade divergente para SKU " + sku
                        + ": pedido=" + pedido
                        + ", packing=" + packing
                        + ", invoice=" + invoice);
    }

    /**
     * Divergência de valor total entre Pedido e Commercial Invoice.
     *
     * @param pedido  valor total no Pedido
     * @param invoice valor total na Commercial Invoice
     */
    public static Divergence total(BigDecimal pedido, BigDecimal invoice) {
        return new Divergence(
                DivergenceType.TOTAL,
                "totalAmount",
                "Valor total divergente: pedido=" + pedido + ", invoice=" + invoice);
    }

    /**
     * Divergência de SKU ausente em um dos documentos.
     *
     * @param sku          SKU que não aparece em todos os documentos
     * @param whereMissing documento(s) onde o SKU está ausente
     */
    public static Divergence skuMissing(String sku, String whereMissing) {
        return new Divergence(
                DivergenceType.SKU_MISSING,
                sku,
                "SKU " + sku + " ausente em: " + whereMissing);
    }
}
