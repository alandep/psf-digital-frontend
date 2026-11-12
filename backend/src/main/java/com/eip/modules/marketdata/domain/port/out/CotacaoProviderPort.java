package com.eip.modules.marketdata.domain.port.out;

import java.util.Map;
import java.util.Set;

import com.eip.modules.marketdata.domain.model.Cotacao;

/**
 * Outbound port: one upstream source of currency-vs-BRL quotes.
 * Implementations must never throw; on any failure they simply omit the
 * affected currencies from the result so the service can fall back to the next
 * source for whatever is still missing.
 */
public interface CotacaoProviderPort {

    /**
     * @param currencies ISO codes of the base currencies (e.g. USD, EUR)
     * @return quotes it could resolve, keyed by currency code (possibly empty)
     */
    Map<String, Cotacao> fetchBrl(Set<String> currencies);
}