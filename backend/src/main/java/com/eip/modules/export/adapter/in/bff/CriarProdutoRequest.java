package com.eip.modules.export.adapter.in.bff;

import java.math.BigDecimal;

import com.eip.modules.export.domain.port.in.ProdutoUseCase.CriarProdutoCommand;

import jakarta.validation.constraints.NotBlank;

/** BFF payload to register a product. */
public record CriarProdutoRequest(
        @NotBlank String name,
        String ncm,
        String description,
        String unit,
        BigDecimal standardPrice,
        String currency,
        String originCountry) {

    public CriarProdutoCommand toCommand() {
        return new CriarProdutoCommand(name, ncm, description, unit, standardPrice,
                currency, originCountry);
    }
}
