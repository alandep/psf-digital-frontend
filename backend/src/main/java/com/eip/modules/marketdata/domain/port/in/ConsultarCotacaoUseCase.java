package com.eip.modules.marketdata.domain.port.in;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;

/** Inbound port: read currency-vs-BRL commercial quotes. */
public interface ConsultarCotacaoUseCase {

    /** Currencies this module can quote against BRL. */
    Set<String> moedasSuportadas();

    /**
     * @param moeda ISO code (case-insensitive), e.g. {@code usd}
     * @throws org.springframework.web.server.ResponseStatusException 400 for an
     *         unsupported currency; 503 when no source is available and there
     *         is no recent cached value
     */
    CotacaoView cotacao(String moeda);

    /** Convenience for the toolbar: the commercial dollar. */
    default CotacaoView dolar() {
        return cotacao("USD");
    }

    /**
     * Batch read, preserving request order. Currencies with no data available
     * are omitted; if none can be served a 503 is raised.
     */
    List<CotacaoView> cotacoes(List<String> moedas);

    /**
     * Read view.
     *
     * @param rate          value to display (the bid)
     * @param varBid        absolute day variation of the bid, may be null
     * @param previousClose bid minus varBid (previous close), may be null
     * @param trend         {@code up}, {@code down} or {@code stable} (day variation)
     * @param stale         true when the upstream failed and a cached value is served
     */
    record CotacaoView(
            String currency,
            String pair,
            BigDecimal rate,
            BigDecimal bid,
            BigDecimal ask,
            BigDecimal high,
            BigDecimal low,
            BigDecimal pctChange,
            BigDecimal varBid,
            BigDecimal previousClose,
            String trend,
            String source,
            String sourceLabel,
            Instant quotedAt,
            boolean stale) {
    }
}