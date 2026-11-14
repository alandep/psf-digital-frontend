package com.eip.modules.marketdata.adapter.in.bff;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.marketdata.domain.model.ExpectativaCambio;
import com.eip.modules.marketdata.domain.port.in.ConsultarExpectativasUseCase;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoint for market expectations (BCB Focus). Global market data, so no
 * {@code @PreAuthorize}; the BFF chain already requires authentication.
 */
@RestController
@RequestMapping("/bff/mercado/expectativas")
@RequiredArgsConstructor
public class ExpectativasBffController {

    private final ConsultarExpectativasUseCase useCase;

    /** Year-end exchange-rate expectations for the current and next year. */
    @GetMapping("/cambio")
    public List<ExpectativaCambio> cambio() {
        return useCase.expectativasCambio();
    }
}
