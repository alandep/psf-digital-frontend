package com.eip.modules.export.adapter.out.persistence;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.export.adapter.out.persistence.ExportAnalyticsJpaRepository.CatalogoProjection;
import com.eip.modules.export.adapter.out.persistence.ExportAnalyticsJpaRepository.CountryProjection;
import com.eip.modules.export.adapter.out.persistence.ExportAnalyticsJpaRepository.KpiProjection;
import com.eip.modules.export.adapter.out.persistence.ExportAnalyticsJpaRepository.MonthlyProjection;
import com.eip.modules.export.adapter.out.persistence.ExportAnalyticsJpaRepository.ProductProjection;
import com.eip.modules.export.adapter.out.persistence.ExportAnalyticsJpaRepository.StatusCountProjection;
import com.eip.modules.export.domain.port.out.DashboardAnalyticsPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter that backs {@link DashboardAnalyticsPort} by delegating to
 * {@link ExportAnalyticsJpaRepository} and mapping the Spring Data interface
 * projections into the port's records.
 *
 * <p>All aggregation is <strong>pushdown</strong> in Postgres
 * (SUM/COUNT/GROUP BY) and <strong>RLS-scoped</strong> to the current tenant —
 * no individual export row is materialized and no manual {@code organization_id}
 * predicate is added, mirroring the convention of
 * {@code AiUsageAnalyticsAdapter}.</p>
 */
@Component
@RequiredArgsConstructor
public class DashboardAnalyticsJpaAdapter implements DashboardAnalyticsPort {

    private final ExportAnalyticsJpaRepository jpa;

    @Override
    public KpiAggregate aggregateKpis(ExportFilter filter) {
        boolean countriesEmpty = isEmpty(filter.countries());
        boolean productsEmpty = isEmpty(filter.products());
        boolean customersEmpty = isEmpty(filter.customers());
        KpiProjection p = jpa.aggregateKpis(
                filter.from(),
                filter.to(),
                countriesOrDummy(filter.countries()),
                countriesEmpty,
                uuidsOrDummy(filter.products()),
                productsEmpty,
                uuidsOrDummy(filter.customers()),
                customersEmpty);
        return new KpiAggregate(
                coalesce(p.getTotalAmount()),
                coalesce(p.getShippedAmount()),
                coalesce(p.getPendingAmount()),
                coalesce(p.getLucro()),
                p.getConfirmedCount());
    }

    @Override
    public StatusCount aggregateStatusCounts() {
        StatusCountProjection p = jpa.aggregateStatusCounts();
        return new StatusCount(
                p.getTotal(),
                coalesce(p.getValorTotal()),
                p.getRascunho(),
                p.getConfirmadas(),
                p.getCanceladas());
    }

    @Override
    public List<MonthlyBucket> aggregateByMonth(ExportFilter filter) {
        return jpa.aggregateByMonth(
                        filter.from(),
                        filter.to(),
                        countriesOrDummy(filter.countries()),
                        isEmpty(filter.countries()),
                        uuidsOrDummy(filter.products()),
                        isEmpty(filter.products()),
                        uuidsOrDummy(filter.customers()),
                        isEmpty(filter.customers()))
                .stream()
                .map(p -> new MonthlyBucket(p.getMonth(), coalesce(p.getAmount())))
                .toList();
    }

    @Override
    public List<CountryBucket> aggregateByCountry(ExportFilter filter) {
        return jpa.aggregateByCountry(
                        filter.from(),
                        filter.to(),
                        countriesOrDummy(filter.countries()),
                        isEmpty(filter.countries()),
                        uuidsOrDummy(filter.products()),
                        isEmpty(filter.products()),
                        uuidsOrDummy(filter.customers()),
                        isEmpty(filter.customers()))
                .stream()
                .map(p -> new CountryBucket(p.getCountry(), coalesce(p.getAmount())))
                .toList();
    }

    @Override
    public List<ProductBucket> aggregateByProduct(ExportFilter filter) {
        return jpa.aggregateByProduct(
                        filter.from(),
                        filter.to(),
                        countriesOrDummy(filter.countries()),
                        isEmpty(filter.countries()),
                        uuidsOrDummy(filter.products()),
                        isEmpty(filter.products()),
                        uuidsOrDummy(filter.customers()),
                        isEmpty(filter.customers()))
                .stream()
                .map(p -> new ProductBucket(p.getProductId(), p.getDescription(), coalesce(p.getAmount())))
                .toList();
    }

    @Override
    public List<String> distinctCountries() {
        return jpa.distinctCountries();
    }

    @Override
    public List<CatalogoRow> distinctProducts() {
        return jpa.distinctProducts().stream()
                .map(DashboardAnalyticsJpaAdapter::toCatalogoRow)
                .toList();
    }

    @Override
    public List<CatalogoRow> distinctCustomers() {
        return jpa.distinctCustomers().stream()
                .map(DashboardAnalyticsJpaAdapter::toCatalogoRow)
                .toList();
    }

    private static CatalogoRow toCatalogoRow(CatalogoProjection p) {
        return new CatalogoRow(p.getId(), p.getLabel());
    }

    /** True when the list is {@code null} or empty (dimension filter disabled). */
    private static boolean isEmpty(List<?> values) {
        return values == null || values.isEmpty();
    }

    /**
     * Returns a single-element dummy list ({@code List.of("")}) when the input
     * is {@code null}/empty so the JPQL {@code in (...)} never degenerates into
     * an invalid empty {@code IN ()}. The companion {@code *Empty} flag
     * short-circuits the predicate so the dummy value never actually matches.
     */
    private static List<String> countriesOrDummy(List<String> values) {
        return isEmpty(values) ? List.of("") : values;
    }

    /**
     * UUID counterpart of {@link #countriesOrDummy}; uses the all-zero UUID as
     * the dummy element.
     */
    private static List<UUID> uuidsOrDummy(List<UUID> values) {
        return isEmpty(values) ? List.of(new UUID(0L, 0L)) : values;
    }

    /** Coerces a {@code null} aggregate to {@link BigDecimal#ZERO}. */
    private static BigDecimal coalesce(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
