package com.eip.modules.export.adapter.out.persistence;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

/**
 * Read/aggregation Spring Data repository for the {@code export} analytics
 * surface backing the Dashboard Principal.
 *
 * <p>All queries perform <strong>pushdown aggregation</strong> in Postgres
 * ({@code SUM}/{@code COUNT}/{@code GROUP BY} + interface projections) and
 * never materialize individual export rows — mirroring the pattern of
 * {@code AiUsageEventJpaRepository}. Tenant isolation is enforced by RLS, so
 * these queries deliberately do <strong>not</strong> add any manual
 * {@code organization_id} predicate (same convention as
 * {@code AiUsageAnalyticsAdapter}).</p>
 *
 * <p>Every dimension filter is optional via the {@code (:param is null or ...)}
 * idiom; passing {@code null} disables that filter.</p>
 */
public interface ExportAnalyticsJpaRepository extends Repository<ExportacaoEntity, UUID> {

    /**
     * Single-pass KPI aggregation over the filtered export set. Pushdown and
     * RLS-scoped. The product filter is applied via an {@code EXISTS} subquery
     * so joining {@code export_item} never duplicates export rows (which would
     * inflate the amount/count sums).
     *
     * @param from      inclusive lower bound on {@code createdAt} (nullable)
     * @param to        exclusive upper bound on {@code createdAt} (nullable)
     * @param countries destination country allow-list (nullable)
     * @param products  product id allow-list applied via EXISTS (nullable)
     * @param customers customer id allow-list (nullable)
     * @return a single projection row with the KPI aggregates
     */
    @Query("""
            select
              coalesce(sum(e.totalAmount), 0) as totalAmount,
              coalesce(sum(case when e.shipped = true then e.totalAmount else 0 end), 0) as shippedAmount,
              coalesce(sum(case when e.shipped = false then e.totalAmount else 0 end), 0) as pendingAmount,
              coalesce(sum(e.totalAmount - coalesce(e.totalCost, 0)), 0) as lucro,
              sum(case when e.status = 'CONFIRMADA' then 1L else 0L end) as confirmedCount
            from ExportacaoEntity e
            where (cast(:from as timestamp) is null or e.createdAt >= :from)
              and (cast(:to as timestamp) is null or e.createdAt < :to)
              and (:countriesEmpty = true or e.destinationCountry in :countries)
              and (:customersEmpty = true or e.customerId in :customers)
              and (:productsEmpty = true or exists (
                    select 1 from ExportItemEntity it
                    where it.export = e and it.productId in :products))
            """)
    KpiProjection aggregateKpis(@Param("from") OffsetDateTime from,
                                @Param("to") OffsetDateTime to,
                                @Param("countries") List<String> countries,
                                @Param("countriesEmpty") boolean countriesEmpty,
                                @Param("products") List<UUID> products,
                                @Param("productsEmpty") boolean productsEmpty,
                                @Param("customers") List<UUID> customers,
                                @Param("customersEmpty") boolean customersEmpty);

    /**
     * Single-pass per-status counts (plus total count and total amount) over
     * <em>all</em> of the tenant's exports, for the <strong>legacy</strong>
     * {@code GET /bff/exportacoes/dashboard} endpoint. Pushdown and RLS-scoped —
     * this replaces the former {@code repo.listar(org, null, 0, 10000)} + Java
     * loop that materialized up to 10&nbsp;000 export rows just to count them.
     *
     * @return a single projection row with the status counts and totals
     */
    @Query("""
            select
              count(e) as total,
              coalesce(sum(e.totalAmount), 0) as valorTotal,
              sum(case when e.status = 'RASCUNHO' then 1L else 0L end) as rascunho,
              sum(case when e.status = 'CONFIRMADA' then 1L else 0L end) as confirmadas,
              sum(case when e.status = 'CANCELADA' then 1L else 0L end) as canceladas
            from ExportacaoEntity e
            """)
    StatusCountProjection aggregateStatusCounts();

    /**
     * Monthly revenue series grouped by {@code YYYY-MM} of {@code createdAt}.
     * Pushdown and RLS-scoped. Uses the Postgres {@code to_char} function to
     * bucket the {@code OffsetDateTime} into a month label. Product filter via
     * EXISTS to avoid row duplication.
     *
     * @return one row per month ordered ascending by month label
     */
    @Query("""
            select
              function('to_char', e.createdAt, 'YYYY-MM') as month,
              coalesce(sum(e.totalAmount), 0) as amount
            from ExportacaoEntity e
            where (cast(:from as timestamp) is null or e.createdAt >= :from)
              and (cast(:to as timestamp) is null or e.createdAt < :to)
              and (:countriesEmpty = true or e.destinationCountry in :countries)
              and (:customersEmpty = true or e.customerId in :customers)
              and (:productsEmpty = true or exists (
                    select 1 from ExportItemEntity it
                    where it.export = e and it.productId in :products))
            group by function('to_char', e.createdAt, 'YYYY-MM')
            order by function('to_char', e.createdAt, 'YYYY-MM')
            """)
    List<MonthlyProjection> aggregateByMonth(@Param("from") OffsetDateTime from,
                                             @Param("to") OffsetDateTime to,
                                             @Param("countries") List<String> countries,
                                             @Param("countriesEmpty") boolean countriesEmpty,
                                             @Param("products") List<UUID> products,
                                             @Param("productsEmpty") boolean productsEmpty,
                                             @Param("customers") List<UUID> customers,
                                             @Param("customersEmpty") boolean customersEmpty);

    /**
     * Revenue series grouped by destination country. Pushdown and RLS-scoped.
     * Product filter via EXISTS to avoid row duplication.
     *
     * @return one row per destination country ordered by amount descending
     */
    @Query("""
            select
              e.destinationCountry as country,
              coalesce(sum(e.totalAmount), 0) as amount
            from ExportacaoEntity e
            where (cast(:from as timestamp) is null or e.createdAt >= :from)
              and (cast(:to as timestamp) is null or e.createdAt < :to)
              and (:countriesEmpty = true or e.destinationCountry in :countries)
              and (:customersEmpty = true or e.customerId in :customers)
              and (:productsEmpty = true or exists (
                    select 1 from ExportItemEntity it
                    where it.export = e and it.productId in :products))
            group by e.destinationCountry
            order by coalesce(sum(e.totalAmount), 0) desc
            """)
    List<CountryProjection> aggregateByCountry(@Param("from") OffsetDateTime from,
                                               @Param("to") OffsetDateTime to,
                                               @Param("countries") List<String> countries,
                                               @Param("countriesEmpty") boolean countriesEmpty,
                                               @Param("products") List<UUID> products,
                                               @Param("productsEmpty") boolean productsEmpty,
                                               @Param("customers") List<UUID> customers,
                                               @Param("customersEmpty") boolean customersEmpty);

    /**
     * Revenue series grouped by product. This is the only aggregation that
     * joins {@code export_item}: it sums line revenue ({@code quantity *
     * unitPrice}) per product. The period/country/customer filters apply to the
     * parent export {@code e}; the product filter applies directly to the item.
     * Pushdown and RLS-scoped.
     *
     * @return one row per product ordered by amount descending
     */
    @Query("""
            select
              it.productId as productId,
              max(it.description) as description,
              coalesce(sum(it.quantity * it.unitPrice), 0) as amount
            from ExportItemEntity it
            join it.export e
            where (cast(:from as timestamp) is null or e.createdAt >= :from)
              and (cast(:to as timestamp) is null or e.createdAt < :to)
              and (:countriesEmpty = true or e.destinationCountry in :countries)
              and (:customersEmpty = true or e.customerId in :customers)
              and (:productsEmpty = true or it.productId in :products)
            group by it.productId
            order by coalesce(sum(it.quantity * it.unitPrice), 0) desc
            """)
    List<ProductProjection> aggregateByProduct(@Param("from") OffsetDateTime from,
                                               @Param("to") OffsetDateTime to,
                                               @Param("countries") List<String> countries,
                                               @Param("countriesEmpty") boolean countriesEmpty,
                                               @Param("products") List<UUID> products,
                                               @Param("productsEmpty") boolean productsEmpty,
                                               @Param("customers") List<UUID> customers,
                                               @Param("customersEmpty") boolean customersEmpty);

    /**
     * Distinct destination countries present in the tenant's exports, for the
     * country filter catalog. Pushdown and RLS-scoped.
     *
     * @return distinct non-null country codes ordered ascending
     */
    @Query("""
            select distinct e.destinationCountry
            from ExportacaoEntity e
            where e.destinationCountry is not null
            order by e.destinationCountry
            """)
    List<String> distinctCountries();

    /**
     * Distinct products referenced by the tenant's export items, for the
     * product filter catalog. Derived from {@code export_item} to keep it
     * simple (no join to a product table). Pushdown and RLS-scoped.
     *
     * @return distinct products with id and a label (latest description)
     */
    @Query("""
            select
              it.productId as id,
              max(it.description) as label
            from ExportItemEntity it
            where it.productId is not null
            group by it.productId
            order by max(it.description)
            """)
    List<CatalogoProjection> distinctProducts();

    /**
     * Distinct customers referenced by the tenant's exports, for the customer
     * filter catalog. The export module only carries {@code customerId} (no
     * Customer entity mapped here), so the id is returned as the label too;
     * resolving a human-readable name is left to a higher layer if needed.
     * Pushdown and RLS-scoped.
     *
     * @return distinct customer ids (label mirrors the id)
     */
    @Query("""
            select distinct
              e.customerId as id,
              str(e.customerId) as label
            from ExportacaoEntity e
            where e.customerId is not null
            order by e.customerId
            """)
    List<CatalogoProjection> distinctCustomers();

    /** Projection for {@link #aggregateStatusCounts}. */
    interface StatusCountProjection {
        long getTotal();

        BigDecimal getValorTotal();

        long getRascunho();

        long getConfirmadas();

        long getCanceladas();
    }

    /** Projection for {@link #aggregateKpis}. */
    interface KpiProjection {
        BigDecimal getTotalAmount();

        BigDecimal getShippedAmount();

        BigDecimal getPendingAmount();

        BigDecimal getLucro();

        long getConfirmedCount();
    }

    /** Projection for {@link #aggregateByMonth}. */
    interface MonthlyProjection {
        String getMonth();

        BigDecimal getAmount();
    }

    /** Projection for {@link #aggregateByCountry}. */
    interface CountryProjection {
        String getCountry();

        BigDecimal getAmount();
    }

    /** Projection for {@link #aggregateByProduct}. */
    interface ProductProjection {
        UUID getProductId();

        String getDescription();

        BigDecimal getAmount();
    }

    /** Projection for {@link #distinctProducts} and {@link #distinctCustomers}. */
    interface CatalogoProjection {
        UUID getId();

        String getLabel();
    }
}
