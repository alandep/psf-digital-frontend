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

    /** Aggregated indicators over the organization's hedge contracts. */
    HedgeMetricas metricas();

    /**
     * Hedge indicators. {@code notionalTotal} sums every non-cancelled contract;
     * {@code notionalAtivo} only the ATIVO ones (raw sum, currencies not converted).
     */
    record HedgeMetricas(
            long total,
            long ativos,
            long exercidos,
            long expirados,
            long cancelados,
            BigDecimal notionalTotal,
            BigDecimal notionalAtivo) {

        public static HedgeMetricas from(List<HedgeContrato> contratos) {
            long ativos = 0;
            long exercidos = 0;
            long expirados = 0;
            long cancelados = 0;
            BigDecimal total = BigDecimal.ZERO;
            BigDecimal ativo = BigDecimal.ZERO;
            for (HedgeContrato h : contratos) {
                switch (h.status()) {
                    case ATIVO -> {
                        ativos++;
                        ativo = ativo.add(h.notional());
                        total = total.add(h.notional());
                    }
                    case EXERCIDO -> {
                        exercidos++;
                        total = total.add(h.notional());
                    }
                    case EXPIRADO -> {
                        expirados++;
                        total = total.add(h.notional());
                    }
                    case CANCELADO -> cancelados++;
                }
            }
            return new HedgeMetricas(contratos.size(), ativos, exercidos, expirados, cancelados,
                    total, ativo);
        }
    }

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
