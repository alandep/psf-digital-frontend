package com.eip.modules.finance.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.eip.modules.finance.domain.model.CambioContrato;
import com.eip.modules.finance.domain.model.CambioId;
import com.eip.modules.finance.domain.model.CambioStatus;
import com.eip.modules.finance.domain.model.CambioTipo;
import com.eip.modules.finance.domain.model.HedgeContrato;
import com.eip.modules.finance.domain.model.HedgeId;
import com.eip.modules.finance.domain.model.HedgeInstrumento;
import com.eip.modules.finance.domain.model.HedgeStatus;
import com.eip.modules.finance.domain.model.Pagamento;
import com.eip.modules.finance.domain.model.PagamentoStatus;
import com.eip.modules.finance.domain.model.PagamentoTipo;
import com.eip.modules.finance.domain.port.in.GerenciarCambioUseCase.BancoResumo;
import com.eip.modules.finance.domain.port.in.GerenciarCambioUseCase.CambioMetricas;
import com.eip.modules.finance.domain.port.in.GerenciarHedgeUseCase.HedgeMetricas;
import com.eip.platform.error.BusinessRuleException;

class FinanceAnalyticsTest {

    private static final LocalDate HOJE = LocalDate.of(2026, 6, 1);
    private static final UUID ORG = UUID.randomUUID();

    private static CambioContrato cambio(String banco, String moeda, String valor, String taxa,
                                         CambioStatus st, LocalDate contratacao, LocalDate liq) {
        return new CambioContrato(CambioId.novo(), ORG, banco, moeda, new BigDecimal(valor),
                new BigDecimal(taxa), CambioTipo.VENDA, st, contratacao, liq, 0L, null);
    }

    @Test
    void metricasCountsStatusesVolumesAndWeightedUsdRate() {
        List<CambioContrato> list = List.of(
                cambio("A", "USD", "1000", "5.00", CambioStatus.ATIVO, HOJE.minusDays(10), HOJE.plusDays(10)),
                cambio("B", "USD", "3000", "5.40", CambioStatus.ATIVO, HOJE.minusDays(20), HOJE.minusDays(1)),
                cambio("A", "EUR", "100", "6.00", CambioStatus.ATIVO, HOJE, HOJE.plusDays(90)),
                cambio("A", "USD", "500", "9.99", CambioStatus.CANCELADO, HOJE, HOJE),
                cambio("B", "USD", "1000", "5.20", CambioStatus.LIQUIDADO, HOJE, HOJE));

        CambioMetricas m = CambioAnalytics.metricas(list, HOJE);

        assertThat(m.totalContratos()).isEqualTo(5);
        assertThat(m.abertos()).isEqualTo(3);
        assertThat(m.liquidados()).isEqualTo(1);
        assertThat(m.cancelados()).isEqualTo(1);
        assertThat(m.vencidos()).isEqualTo(1);
        assertThat(m.vencendo30Dias()).isEqualTo(1);
        // 5000 + 16200 + 600 + 5200
        assertThat(m.volumeBrlTotal()).isEqualByComparingTo("27000.00");
        assertThat(m.volumeBrlAberto()).isEqualByComparingTo("21800.00");
        // (5000 + 16200 + 5200) / (1000 + 3000 + 1000)
        assertThat(m.taxaMediaPonderadaUsd()).isEqualByComparingTo("5.28");
    }

    @Test
    void metricasHasNullUsdRateWithoutUsdContracts() {
        CambioMetricas m = CambioAnalytics.metricas(List.of(), HOJE);

        assertThat(m.totalContratos()).isZero();
        assertThat(m.taxaMediaPonderadaUsd()).isNull();
        assertThat(m.volumeBrlTotal()).isEqualByComparingTo("0");
    }

    @Test
    void bancosGroupsNonCancelledByBankOrderedByBestRate() {
        List<CambioContrato> list = List.of(
                cambio("Banco A", "USD", "1000", "5.00", CambioStatus.ATIVO, HOJE.minusDays(5), null),
                cambio("Banco A", "USD", "1000", "5.20", CambioStatus.LIQUIDADO, HOJE.minusDays(1), null),
                cambio("Banco B", "USD", "2000", "5.30", CambioStatus.ATIVO, HOJE.minusDays(3), null),
                cambio("Banco B", "USD", "9000", "1.00", CambioStatus.CANCELADO, HOJE, null),
                cambio("Banco C", "EUR", "100", "6.00", CambioStatus.ATIVO, HOJE, null),
                cambio(null, "usd", "100", "5.10", CambioStatus.ATIVO, HOJE.minusDays(9), null));

        List<BancoResumo> r = CambioAnalytics.bancos(list, "USD");

        assertThat(r).extracting(BancoResumo::bank)
                .containsExactly("Banco B", "Banco A", CambioAnalytics.BANCO_NAO_INFORMADO)
                .doesNotContain("Banco C");
        BancoResumo a = r.get(1);
        assertThat(a.contratos()).isEqualTo(2);
        assertThat(a.volumeBrl()).isEqualByComparingTo("10200.00");
        assertThat(a.taxaMediaPonderada()).isEqualByComparingTo("5.10");
        assertThat(a.ultimaTaxa()).isEqualByComparingTo("5.20");
        assertThat(a.ultimaOperacao()).isEqualTo(HOJE.minusDays(1));
    }

    @Test
    void hedgeMetricasCountsByStatusAndSumsNotional() {
        List<HedgeContrato> list = List.of(
                hedge("1000", HedgeStatus.ATIVO),
                hedge("2000", HedgeStatus.ATIVO),
                hedge("500", HedgeStatus.EXERCIDO),
                hedge("300", HedgeStatus.EXPIRADO),
                hedge("700", HedgeStatus.CANCELADO));

        HedgeMetricas m = HedgeMetricas.from(list);

        assertThat(m.total()).isEqualTo(5);
        assertThat(m.ativos()).isEqualTo(2);
        assertThat(m.exercidos()).isEqualTo(1);
        assertThat(m.expirados()).isEqualTo(1);
        assertThat(m.cancelados()).isEqualTo(1);
        assertThat(m.notionalTotal()).isEqualByComparingTo("3800");
        assertThat(m.notionalAtivo()).isEqualByComparingTo("3000");
    }

    private static HedgeContrato hedge(String notional, HedgeStatus st) {
        return new HedgeContrato(HedgeId.novo(), ORG, HedgeInstrumento.NDF, "USD",
                new BigDecimal(notional), new BigDecimal("5.5"), HOJE.plusDays(30), st, 0L);
    }

    @Test
    void pagamentoIsAtrasadoOnlyWhenPendingAndPastDue() {
        Pagamento p = Pagamento.novo(ORG, null, PagamentoTipo.RECEBIMENTO, "x", null, null, null,
                null, null, new BigDecimal("10"), "usd", HOJE.minusDays(1));

        assertThat(p.currency()).isEqualTo("USD");
        assertThat(p.statusEm(HOJE)).isEqualTo(PagamentoStatus.ATRASADO);
        assertThat(p.statusEm(HOJE.minusDays(1))).isEqualTo(PagamentoStatus.PENDENTE);

        p.marcarPago(null);
        assertThat(p.statusEm(HOJE)).isEqualTo(PagamentoStatus.PAGO);
        assertThatThrownBy(() -> p.editar(null, PagamentoTipo.RECEBIMENTO, null, null, null, null,
                null, null, new BigDecimal("10"), "USD", HOJE))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Somente lançamentos em aberto podem ser editados.");
    }

    @Test
    void pagamentoValidatesAmountCurrencyAndDueDate() {
        assertThatThrownBy(() -> Pagamento.novo(ORG, null, PagamentoTipo.PAGAMENTO, null, null,
                null, null, null, null, BigDecimal.ZERO, "USD", HOJE))
                .isInstanceOf(BusinessRuleException.class);
        assertThatThrownBy(() -> Pagamento.novo(ORG, null, PagamentoTipo.PAGAMENTO, null, null,
                null, null, null, null, BigDecimal.ONE, "US", HOJE))
                .isInstanceOf(BusinessRuleException.class);
        assertThatThrownBy(() -> Pagamento.novo(ORG, null, PagamentoTipo.PAGAMENTO, null, null,
                null, null, null, null, BigDecimal.ONE, "USD", null))
                .isInstanceOf(BusinessRuleException.class);
    }
}
