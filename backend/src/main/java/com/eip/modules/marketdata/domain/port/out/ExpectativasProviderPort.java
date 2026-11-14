package com.eip.modules.marketdata.domain.port.out;

import java.util.List;

import com.eip.modules.marketdata.domain.model.ExpectativaCambio;

/**
 * Outbound port: source of annual market expectations for the exchange rate.
 * Implementations must never throw; on any failure they return an empty list.
 */
public interface ExpectativasProviderPort {

    /**
     * @return the latest expectation of each reference year available upstream,
     *         ordered by year (possibly empty)
     */
    List<ExpectativaCambio> buscarCambio();
}
