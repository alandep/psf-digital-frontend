package com.eip.modules.marketdata.domain.model;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * A currency-vs-BRL quote as reported by an upstream source.
 *
 * @param pair        pair code, e.g. {@code USD/BRL}
 * @param bid         buy price (what the market pays for 1 unit of the base currency)
 * @param ask         sell price, may be {@code null}
 * @param high        day high, may be {@code null}
 * @param low         day low, may be {@code null}
 * @param pctChange   day variation in percent, may be {@code null}
 * @param varBid      absolute day variation of the bid, may be {@code null}
 * @param quotedAt    moment the source produced the quote
 * @param source      stable source code (e.g. {@code AWESOMEAPI}, {@code BCB_PTAX})
 * @param sourceLabel human-readable source name for the UI
 */
public record Cotacao(
        String pair,
        BigDecimal bid,
        BigDecimal ask,
        BigDecimal high,
        BigDecimal low,
        BigDecimal pctChange,
        BigDecimal varBid,
        Instant quotedAt,
        String source,
        String sourceLabel) {
}