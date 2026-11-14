package com.eip.modules.marketdata.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Market expectation for the year-end BRL/USD exchange rate (BCB Focus survey).
 *
 * @param anoReferencia calendar year the expectation refers to (e.g. "2026")
 * @param mediana       median expected rate
 * @param media         mean expected rate (may be {@code null})
 * @param dataPesquisa  date of the survey the figures come from
 * @param fonte         human-readable source label
 */
public record ExpectativaCambio(
        String anoReferencia,
        BigDecimal mediana,
        BigDecimal media,
        LocalDate dataPesquisa,
        String fonte) {
}
