package com.eip.modules.export.domain.port.out;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Porta de saída de LEITURA/AGREGAÇÃO para o Dashboard Principal (ISP: separada
 * da porta de escrita do agregado, {@link ExportacaoRepositoryPort}). Todas as
 * agregações são pushdown no banco (GROUP BY/SUM/COUNT) e restritas ao tenant
 * corrente por RLS — nenhuma linha individual de exportação é materializada.
 */
public interface DashboardAnalyticsPort {

    /** KPIs escalares numa única passada (SUM/COUNT condicionais). */
    KpiAggregate aggregateKpis(ExportFilter filter);

    /**
     * Contagens por status (mais contagem total e valor total) de todas as
     * exportações do tenant numa única passada agregada. Serve ao endpoint
     * <strong>legado</strong> {@code GET /bff/exportacoes/dashboard}, que antes
     * carregava até 10.000 linhas e agregava em loop Java.
     */
    StatusCount aggregateStatusCounts();

    List<MonthlyBucket> aggregateByMonth(ExportFilter filter);

    List<CountryBucket> aggregateByCountry(ExportFilter filter);

    List<ProductBucket> aggregateByProduct(ExportFilter filter);

    List<String> distinctCountries();

    List<CatalogoRow> distinctProducts();

    List<CatalogoRow> distinctCustomers();

    /** Filtro de agregação; qualquer campo null/vazio significa sem restrição. */
    record ExportFilter(OffsetDateTime from, OffsetDateTime to,
                        List<String> countries, List<UUID> products, List<UUID> customers) {}

    /** KPIs escalares agregados. */
    record KpiAggregate(BigDecimal totalAmount, BigDecimal shippedAmount,
                        BigDecimal pendingAmount, BigDecimal lucro, long confirmedCount) {}

    /** Contagens por status + totais para o dashboard legado. */
    record StatusCount(long total, BigDecimal valorTotal,
                       long rascunho, long confirmadas, long canceladas) {}

    record MonthlyBucket(String month, BigDecimal amount) {}

    record CountryBucket(String country, BigDecimal amount) {}

    record ProductBucket(UUID productId, String description, BigDecimal amount) {}

    record CatalogoRow(UUID id, String label) {}
}
