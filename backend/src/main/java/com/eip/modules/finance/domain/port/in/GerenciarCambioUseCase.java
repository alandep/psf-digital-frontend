package com.eip.modules.finance.domain.port.in;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.eip.modules.finance.domain.model.CambioContrato;

/**
 * Inbound port: manage FX contracts.
 */
public interface GerenciarCambioUseCase {

    List<CambioView> listar(String status);

    CambioView porId(UUID id);

    CambioView criar(CriarCambioCommand cmd);

    CambioView liquidar(UUID id);

    CambioView cancelar(UUID id);

    /** Aggregated indicators over the organization's FX contracts. */
    CambioMetricas metricas();

    /** Per-bank comparison of the non-cancelled contracts of one currency. */
    List<BancoResumo> bancos(String moeda);

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
            LocalDate dataLiquidacao,
            OffsetDateTime createdAt) {

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
                    c.dataLiquidacao(),
                    c.createdAt());
        }
    }

    /**
     * FX indicators. "Open" means status ATIVO; "vencidos" are open contracts
     * whose settlement date has passed (a subset of {@code abertos}). BRL
     * volumes ignore cancelled contracts.
     */
    record CambioMetricas(
            long totalContratos,
            long abertos,
            long liquidados,
            long cancelados,
            long vencidos,
            BigDecimal volumeBrlTotal,
            BigDecimal volumeBrlAberto,
            BigDecimal taxaMediaPonderadaUsd,
            long vencendo30Dias) {
    }

    /** Aggregated figures of one bank for a currency. */
    record BancoResumo(
            String bank,
            long contratos,
            BigDecimal volumeBrl,
            BigDecimal taxaMediaPonderada,
            BigDecimal ultimaTaxa,
            LocalDate ultimaOperacao) {
    }
}
