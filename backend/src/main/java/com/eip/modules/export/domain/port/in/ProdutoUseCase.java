package com.eip.modules.export.domain.port.in;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Inbound port: list and register reusable products. */
public interface ProdutoUseCase {

    List<ProdutoView> listar();

    ProdutoView criar(CriarProdutoCommand cmd);

    /** Command to register a new product. */
    record CriarProdutoCommand(String name, String ncm, String description,
                               String unit, BigDecimal standardPrice, String currency,
                               String originCountry) {
    }

    /** Read view of a product. */
    record ProdutoView(UUID id, String name, String ncm, String description,
                       String unit, BigDecimal standardPrice, String currency,
                       String originCountry) {
    }
}
