package com.eip.modules.ai.application;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.port.in.AiOperationsQueryUseCase;
import com.eip.modules.ai.domain.port.out.AiUsageAnalyticsPort;
import com.eip.modules.ai.domain.port.out.AiUsageAnalyticsPort.CapabilityAggregate;
import com.eip.modules.ai.domain.port.out.AiUsageAnalyticsPort.RecentFailure;
import com.eip.modules.ai.domain.port.out.ModelRouterPort;

import lombok.RequiredArgsConstructor;

/**
 * Serviço de aplicação para a observabilidade do AI Operations Center
 * (Requisitos 13.1–13.10). Compõe os sinais do ledger ({@link AiUsageAnalyticsPort})
 * com a derivação determinística de status ({@link CapabilityStatusResolver}) e
 * o conjunto de tasks habilitadas no router ({@link ModelRouterPort#all()}),
 * mapeando capacidades reais às views da tela — sem agentes fantasma.
 *
 * <p>As consultas são somente leitura e já escopadas ao tenant por RLS; não há
 * filtro explícito de {@code organization_id} aqui.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiOperationsService implements AiOperationsQueryUseCase {

    private final AiUsageAnalyticsPort analytics;
    private final CapabilityStatusResolver statusResolver;
    private final ModelRouterPort router;

    /** Rótulos amigáveis por capacidade; ausentes caem no próprio nome da operação. */
    private static final Map<String, String> LABELS = Map.of(
            "NCM_CLASSIFICATION", "Classificação NCM",
            "DOCUMENT_SUMMARY", "Resumo de Documento",
            "TRANSLATION", "Tradução",
            "RISK_ANALYSIS", "Análise de Risco",
            "DOCUMENT_EXTRACTION", "Extração de Documento",
            "CHAT", "Assistente (Chat)",
            "TRANSPORT_SIMULATION", "Simulação de Transporte",
            "EXPORT_NL_CREATION", "Criação por Linguagem Natural",
            "OCR_DOCUMENT", "OCR de Documento");

    @Override
    public List<CapabilityMetricView> capabilityMetrics(MetricsWindow window) {
        OffsetDateTime since = switch (window) {
            case LAST_24H -> OffsetDateTime.now().minusHours(24);
            case LAST_7D -> OffsetDateTime.now().minusDays(7);
        };

        // Tasks presentes em all() estão HABILITADAS no router; ausentes são
        // consideradas desabilitadas (→ MAINTENANCE) pela derivação de status.
        Set<String> enabledOps = router.all().stream()
                .map(AiModel::task)
                .map(Enum::name)
                .collect(Collectors.toSet());

        return analytics.aggregateByOperation(since).stream()
                .map(agg -> toView(agg, enabledOps))
                .toList();
    }

    private CapabilityMetricView toView(CapabilityAggregate agg, Set<String> enabledOps) {
        String status = statusResolver.resolve(
                agg.requests(), agg.failures(), agg.avgLatencyMs(),
                enabledOps.contains(agg.operation()));

        // accuracy só seria preenchida para NCM_CLASSIFICATION e OCR_DOCUMENT
        // quando houvesse um sinal de confiança persistido. Hoje não há coluna de
        // confiança em ai_usage_event, então agg.avgConfidence() é sempre null —
        // null para todas as capacidades, e a UI renderiza "n/a". Não inventamos
        // número.
        Double accuracy = agg.avgConfidence();

        String label = LABELS.getOrDefault(agg.operation(), agg.operation());

        // lastError/lastErrorAt ficam null aqui: a semântica é "último erro" e os
        // erros detalhados (com categoria e horário) vêm de recentErrors().
        return new CapabilityMetricView(
                agg.operation(),
                label,
                agg.requests(),
                agg.avgLatencyMs(),
                agg.totalCost(),
                accuracy,
                status,
                null,
                null);
    }

    @Override
    public List<AiErrorView> recentErrors(int limit) {
        return analytics.recentFailures(limit).stream()
                .map(this::toErrorView)
                .toList();
    }

    private AiErrorView toErrorView(RecentFailure failure) {
        // category e detail usam a mesma failureCategory; não há detalhe adicional
        // persistido além da categoria.
        return new AiErrorView(failure.operation(), failure.at(),
                failure.failureCategory(), failure.failureCategory());
    }
}
