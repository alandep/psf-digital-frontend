package com.eip.modules.export.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.compliance.domain.port.in.ComplianceAlertCountPort;
import com.eip.modules.export.domain.model.Margem;
import com.eip.modules.export.domain.port.in.DashboardAnalyticsUseCase;
import com.eip.modules.export.domain.port.out.DashboardAnalyticsPort;
import com.eip.modules.export.domain.port.out.DashboardAnalyticsPort.CountryBucket;
import com.eip.modules.export.domain.port.out.DashboardAnalyticsPort.ExportFilter;
import com.eip.modules.export.domain.port.out.DashboardAnalyticsPort.KpiAggregate;

import lombok.RequiredArgsConstructor;

/**
 * Serviço de aplicação que compõe os 7 KPIs e as 3 séries (mês/país/produto) do
 * Dashboard Principal a partir das agregações pushdown ({@link DashboardAnalyticsPort})
 * e da contagem de alertas via a API pública do módulo compliance
 * ({@link ComplianceAlertCountPort}).
 *
 * <p>Todas as agregações já são restritas ao tenant corrente por RLS na porta OUT;
 * aqui apenas derivamos valores puros (margem via {@link Margem} e percentual por
 * país) sem materializar linhas individuais.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardAnalyticsService implements DashboardAnalyticsUseCase {

    private static final int SCALE = 2;

    /** Porta OUT de leitura/agregação (pushdown no banco, RLS por tenant). */
    private final DashboardAnalyticsPort analytics;

    /** Porta pública do módulo compliance (Spring Modulith) para contagem de alertas. */
    private final ComplianceAlertCountPort compliance;

    @Override
    public DashboardAnalyticsView analytics(DashboardQuery q) {
        ExportFilter filter = new ExportFilter(
                q.dataInicio(), q.dataFim(), q.paises(), q.produtos(), q.clientes());

        KpiAggregate kpi = analytics.aggregateKpis(filter);

        // Série por mês.
        List<SerieMesView> meses = analytics.aggregateByMonth(filter).stream()
                .map(b -> new SerieMesView(b.month(), b.amount()))
                .toList();

        // Série por produto (descrição quando presente, senão o id do produto).
        List<SerieProdutoView> produtos = analytics.aggregateByProduct(filter).stream()
                .map(b -> new SerieProdutoView(
                        b.description() != null ? b.description() : b.productId().toString(),
                        b.amount()))
                .toList();

        // Série por país com PERCENTUAL derivado na aplicação (garante soma ~100% — Property 1).
        List<CountryBucket> paisesAgg = analytics.aggregateByCountry(filter);
        BigDecimal totalPais = paisesAgg.stream()
                .map(CountryBucket::amount)
                .map(v -> v == null ? BigDecimal.ZERO : v)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<SeriePaisView> paises = paisesAgg.stream()
                .map(b -> {
                    BigDecimal amount = b.amount() == null ? BigDecimal.ZERO : b.amount();
                    BigDecimal percentual = totalPais.signum() > 0
                            ? amount.multiply(BigDecimal.valueOf(100))
                                    .divide(totalPais, SCALE, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO.setScale(SCALE, RoundingMode.HALF_UP);
                    return new SeriePaisView(b.country(), amount, percentual);
                })
                .toList();

        // Alertas de compliance via porta pública (mesma janela temporal do filtro).
        long alertas = compliance.contarAlertas(q.dataInicio(), q.dataFim());

        BigDecimal receita = kpi.totalAmount();
        BigDecimal lucro = kpi.lucro();
        BigDecimal margemFracao = Margem.calcular(lucro, receita);

        // DECISÃO DE ESCALA (contrato do front): o componente DashboardPrincipalComponent
        // exibe `margem_media` via formatPercentage(value), que faz `value / 100` dentro do
        // Intl.NumberFormat (style: 'percent'). Portanto o backend DEVE enviar a margem em
        // escala 0..100 (ex.: 18.75 para 18,75%), e NÃO a fração 0..1 devolvida por
        // Margem.calcular. Multiplicamos a fração por 100 (scale 2, HALF_UP).
        BigDecimal margemMedia = margemFracao
                .multiply(BigDecimal.valueOf(100))
                .setScale(SCALE, RoundingMode.HALF_UP);

        KpisView kpis = new KpisView(
                receita,
                kpi.shippedAmount(),
                kpi.pendingAmount(),
                lucro,
                margemMedia,
                kpi.confirmedCount(),
                alertas);

        return new DashboardAnalyticsView(kpis, meses, paises, produtos);
    }

    @Override
    public OptionsFiltersView catalogos() {
        return new OptionsFiltersView(
                analytics.distinctCountries(),
                analytics.distinctProducts().stream()
                        .map(r -> new CatalogoItem(r.id(), r.label()))
                        .toList(),
                analytics.distinctCustomers().stream()
                        .map(r -> new CatalogoItem(r.id(), r.label()))
                        .toList());
    }
}
