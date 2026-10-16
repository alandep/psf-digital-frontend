package com.eip.modules.export.adapter.in.bff;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.export.domain.port.in.DashboardAnalyticsUseCase;
import com.eip.modules.export.domain.port.in.DashboardAnalyticsUseCase.DashboardAnalyticsView;
import com.eip.modules.export.domain.port.in.DashboardAnalyticsUseCase.DashboardQuery;
import com.eip.modules.export.domain.port.in.DashboardAnalyticsUseCase.OptionsFiltersView;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the Dashboard Principal screen. Serve os KPIs e as três
 * séries agregadas (mês/país/produto) e os catálogos de filtro, todos derivados
 * das exportações reais do tenant (RLS). Agregação pushdown no banco — nunca
 * materializa linhas individuais (diferente do dashboard legado).
 *
 * <p>Bean name explícito para não colidir com o {@code DashboardBffController}
 * do módulo {@code bi} (que mapeia {@code /bff/bi/dashboards}).
 */
@RestController("exportDashboardBffController")
@RequestMapping("/bff/dashboards/principal")
@RequiredArgsConstructor
public class DashboardBffController {

    private final DashboardAnalyticsUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('dashboards/principal','view') or @rbac.can('exportacoes/gerenciar','view')")
    public DashboardAnalyticsView analytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dataFim,
            @RequestParam(required = false) List<String> paises,
            @RequestParam(required = false) List<UUID> produtos,
            @RequestParam(required = false) List<UUID> clientes) {
        return useCase.analytics(new DashboardQuery(dataInicio, dataFim, paises, produtos, clientes));
    }

    @GetMapping("/filtros")
    @PreAuthorize("@rbac.can('dashboards/principal','view') or @rbac.can('exportacoes/gerenciar','view')")
    public OptionsFiltersView filtros() {
        return useCase.catalogos();
    }
}
