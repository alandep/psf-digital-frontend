package com.eip.modules.finance.domain.port.in;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.eip.modules.finance.domain.model.CambioContrato;

/**
 * Inbound port: manage FX contracts.
 */
public interface GerenciarCambioUseCase {

    List<CambioView> listar(String status);

    CambioView criar(CriarCambioCommand cmd);

    CambioView liquidar(UUID id);

    CambioView cancelar(UUID id);

    /** Command to create an FX contract. */
    record CriarCambioCommand(
            String banco,
            String moeda,
            BigDecimal valor,
            BigDecimal taxa,
            String tipo,
            LocalDate dataContratacao,
            LocalDate dataLiquidacao) {
    }

    /** Read view of a single FX contract. */
    record CambioView(
            UUID id,
            String banco,
            String moeda,
            BigDecimal valor,
            BigDecimal taxa,
            String tipo,
            String status,
            LocalDate dataContratacao,
            LocalDate dataLiquidacao) {

        public static CambioView from(CambioContrato c) {
            return new CambioView(
                    c.id().value(),
                    c.banco(),
                    c.moeda(),
                    c.valor(),
                    c.taxa(),
                    c.tipo() == null ? null : c.tipo().name(),
                    c.status().name(),
                    c.dataContratacao(),
                    c.dataLiquidacao());
        }
    }
}
