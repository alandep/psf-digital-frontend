package com.eip.modules.export.domain.port.in;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Porta de entrada (SRP) do analytics do Dashboard Principal, separada de
 * {@link ListarExportacoesUseCase}. Devolve os KPIs e as três séries agregadas
 * (mês/país/produto) e os catálogos de filtro, todos derivados das exportações
 * reais do tenant (RLS) e da API pública do módulo compliance.
 */
public interface DashboardAnalyticsUseCase {

    DashboardAnalyticsView analytics(DashboardQuery query);

    OptionsFiltersView catalogos();

    /** Filtro do dashboard; qualquer campo null/vazio = sem restrição. */
    record DashboardQuery(
            OffsetDateTime dataInicio,
            OffsetDateTime dataFim,
            List<String> paises,
            List<UUID> produtos,
            List<UUID> clientes) {}

    record DashboardAnalyticsView(
            KpisView kpis,
            List<SerieMesView> exportacoesPorMes,
            List<SeriePaisView> exportacoesPorPais,
            List<SerieProdutoView> exportacoesPorProduto) {}

    record KpisView(
            BigDecimal totalExportacoes,
            BigDecimal totalEmbarcado,
            BigDecimal totalPendente,
            BigDecimal lucroEstimado,
            BigDecimal margemMedia,
            long contratosAtivos,
            long alertasCompliance) {}

    record SerieMesView(String mes, BigDecimal valor) {}

    record SeriePaisView(String pais, BigDecimal valor, BigDecimal percentual) {}

    record SerieProdutoView(String produto, BigDecimal valor) {}

    record OptionsFiltersView(List<String> paises, List<CatalogoItem> produtos, List<CatalogoItem> clientes) {}

    record CatalogoItem(UUID id, String label) {}
}
