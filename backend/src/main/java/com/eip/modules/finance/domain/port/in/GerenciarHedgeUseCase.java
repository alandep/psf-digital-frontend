package com.eip.modules.finance.domain.port.in;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.eip.modules.finance.domain.model.HedgeContrato;

/**
 * Inbound port: manage hedge contracts.
 */
public interface GerenciarHedgeUseCase {

    List<HedgeView> listar(String status);

    HedgeView criar(CriarHedgeCommand cmd);

    HedgeView exercer(UUID id);

    HedgeView expirar(UUID id);

    HedgeView cancelar(UUID id);

    /** Command to create a hedge contract. */
    record CriarHedgeCommand(
            String instrumento,
            String moeda,
            BigDecimal notional,
            BigDecimal strike,
            LocalDate vencimento) {
    }

    /** Read view of a single hedge contract. */
    record HedgeView(
            UUID id,
            String instrumento,
            String moeda,
            BigDecimal notional,
            BigDecimal strike,
            LocalDate vencimento,
            String status) {

        public static HedgeView from(HedgeContrato h) {
            return new HedgeView(
                    h.id().value(),
                    h.instrumento() == null ? null : h.instrumento().name(),
                    h.moeda(),
                    h.notional(),
                    h.strike(),
                    h.vencimento(),
                    h.status().name());
        }
    }
}
