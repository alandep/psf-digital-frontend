package com.eip.modules.finance.domain.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * A saved profitability analysis. The detailed result is kept as a raw JSON
 * document ({@code payloadJson}) so the screen can evolve without migrations;
 * the headline figures are denormalized for listing.
 *
 * @param payloadJson a serialized JSON object
 */
public record RentabilidadeAnalise(
        UUID id,
        UUID organizationId,
        UUID userId,
        String exportacaoRef,
        String produto,
        Integer score,
        BigDecimal margem,
        BigDecimal lucroBrl,
        String payloadJson,
        OffsetDateTime createdAt) {
}
