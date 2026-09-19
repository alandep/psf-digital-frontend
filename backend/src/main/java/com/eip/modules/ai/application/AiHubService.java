package com.eip.modules.ai.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiRequest;
import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase;
import com.eip.modules.ai.domain.port.in.UsageQueryUseCase;
import com.eip.modules.ai.domain.port.out.AiGatewayPort;
import com.eip.modules.ai.domain.port.out.AiJobPort;
import com.eip.modules.ai.domain.port.out.AiJobPort.AiJobSnapshot;
import com.eip.modules.ai.domain.port.out.AiUsageLedgerPort;
import com.eip.modules.ai.domain.port.out.ModelRouterPort;
import com.eip.modules.ai.domain.port.out.QuotaPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service for the AI Hub. Resolves a model for the task, checks the
 * tenant's AI franquia, runs the provider gateway, meters usage into the ledger
 * and records a domain event — all within one transaction. Heavy tasks are
 * enqueued as {@code ai_job}s instead of running inline.
 */
@Service
@RequiredArgsConstructor
public class AiHubService implements AnalyzeUseCase, UsageQueryUseCase {

    private static final String AGGREGATE_TYPE = "AiUsage";
    private static final String AI_FEATURE = "AI";

    private final ModelRouterPort router;
    private final AiGatewayPort gateway;
    private final AiUsageLedgerPort ledger;
    private final QuotaPort quota;
    private final AiJobPort jobs;
    private final OutboxPublisher outbox;

    private static OrganizationContext ctx() {
        return OrganizationContextHolder.current();
    }

    private static AiTask parseTask(String task) {
        if (task == null || task.isBlank()) {
            throw new BusinessRuleException("Tarefa de IA obrigatoria");
        }
        try {
            return AiTask.valueOf(task.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException("Tarefa de IA invalida: " + task);
        }
    }

    @Override
    @Transactional
    public AnalysisView analyze(AnalyzeCommand cmd) {
        OrganizationContext context = ctx();
        UUID org = context.organizationId().value();
        UUID userId = context.userId();
        AiTask task = parseTask(cmd.task());

        if (!quota.hasRemaining(org, AI_FEATURE)) {
            throw new AiQuotaExceededException(
                    "Franquia de IA esgotada. Adquira creditos de IA para continuar.");
        }

        AiModel model = router.resolve(task);
        AiRequest request = new AiRequest(task, cmd.input(), org, userId);
        AiResult result = gateway.run(model, request);

        String requestId = UUID.randomUUID().toString();
        ledger.record(org, userId, task, result, requestId);
        outbox.record(AGGREGATE_TYPE, requestId, org, "IaUtilizada", usagePayload(task, result));

        return new AnalysisView(task.name(), result.output(), result.provider(),
                result.model(), result.inputUnits(), result.outputUnits(), result.ocrPages());
    }

    @Override
    @Transactional
    public JobView analyzeAsync(AnalyzeCommand cmd) {
        OrganizationContext context = ctx();
        UUID org = context.organizationId().value();
        UUID userId = context.userId();
        AiTask task = parseTask(cmd.task());

        if (!quota.hasRemaining(org, AI_FEATURE)) {
            throw new AiQuotaExceededException(
                    "Franquia de IA esgotada. Adquira creditos de IA para continuar.");
        }

        UUID jobId = jobs.enqueue(org, userId, task, cmd.input());
        return new JobView(jobId, "QUEUED");
    }

    @Override
    @Transactional(readOnly = true)
    public JobView jobStatus(UUID jobId) {
        UUID org = ctx().organizationId().value();
        AiJobSnapshot snapshot = jobs.status(jobId, org)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job de IA nao encontrado: " + jobId));
        return new JobView(snapshot.id(), snapshot.status());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsageView> currentUsage() {
        UUID org = ctx().organizationId().value();
        return quota.forOrg(org).stream()
                .map(q -> new UsageView(q.feature(), q.feature(), q.used(),
                        q.included(), "credits", percent(q.used(), q.included())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModelRouteView> routerConfig() {
        return router.all().stream()
                .map(m -> new ModelRouteView(m.task().name(), m.priority().name(),
                        m.provider(), m.model(), true))
                .toList();
    }

    private static String usagePayload(AiTask task, AiResult result) {
        return "{\"task\":\"" + task.name()
                + "\",\"provider\":\"" + result.provider()
                + "\",\"model\":\"" + result.model()
                + "\",\"inputUnits\":" + result.inputUnits()
                + ",\"outputUnits\":" + result.outputUnits()
                + ",\"ocrPages\":" + result.ocrPages() + "}";
    }

    private static int percent(BigDecimal used, BigDecimal included) {
        if (included == null || included.signum() <= 0 || used == null) {
            return 0;
        }
        int pct = used.multiply(BigDecimal.valueOf(100))
                .divide(included, 0, RoundingMode.HALF_UP)
                .intValue();
        return Math.min(100, Math.max(0, pct));
    }
}
