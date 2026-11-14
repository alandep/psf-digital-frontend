package com.eip.modules.marketdata.domain.port.in;

import java.util.List;

import com.eip.modules.marketdata.domain.model.ExpectativaCambio;

/**
 * Inbound port: market expectations for the exchange rate.
 */
public interface ConsultarExpectativasUseCase {

    /**
     * Expectations for the current and next calendar year.
     *
     * @throws org.springframework.web.server.ResponseStatusException 503 when no data is available
     */
    List<ExpectativaCambio> expectativasCambio();
}
