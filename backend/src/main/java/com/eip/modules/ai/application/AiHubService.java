package com.eip.modules.ai.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.ai.domain.model.AiExecutionPolicy;
import com.eip.modules.ai.domain.model.AiLedgerEntry;
import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiOutcome;
import com.eip.modules.ai.domain.model.AiPromptSpec;
import com.eip.modules.ai.domain.model.AiRequest;
import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase;
import com.eip.modules.ai.domain.port.in.UsageQueryUseCase;
import com.eip.modules.ai.domain.port.out.AiExecutionPolicyResolver;
import com.eip.modules.ai.domain.port.out.AiGatewayPort;
import com.eip.modules.ai.domain.port.out.AiJobPort;
import com.eip.modules.ai.domain.port.out.AiJobPort.AiJobSnapshot;
import com.eip.modules.ai.domain.port.out.AiPriceCatalogPort;
import com.eip.modules.ai.domain.port.out.AiPromptRegistry;
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
    private final AiExecutionPolicyResolver policyResolver;
    private final AiPromptRegistry promptRegistry;
    private final AiGatewayPort gateway;
    private final ExtractionIdempotencyService idempotency;
    private final ExtractionResultValidator extractionValidator;
    private final AiUsageLedgerPort ledger;
    private final AiPriceCatalogPort priceCatalog;
    private final QuotaPort quota;
    private final AiJobPort jobs;
    private final OutboxPublisher outbox;
    private final AiCallLogger aiCallLogger;

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

        // Policy and prompt are resolved here, in the application layer — never in
        // controllers and never in the provider adapter (Requirements 5.3, 6.1).
        AiExecutionPolicy policy = policyResolver.resolve(task);
        AiModel model = policy.model();
        AiPromptSpec prompt = promptRegistry.specFor(task, cmd.input());
        AiRequest request = new AiRequest(task, cmd.input(), org, userId);

        try {
            // Structured extraction goes through the idempotency cache (task 9.3): the
            // same tenant+doc+task+promptVersion+modelVersion key skips a redundant
            // Gemini call on a cache hit (Property 4, Requirements 10.1-10.4). Other
            // tasks call the gateway directly.
            AiResult result = (task == AiTask.DOCUMENT_EXTRACTION)
                    ? idempotency.extract(org, model, request, policy, prompt)
                    : gateway.run(model, request, policy, prompt);

            // Extraction output is parsed + validated BEFORE any persistence (task 9.2):
            // an invalid invoice extraction throws a descriptive error here, so no
            // invalid DTO is ever recorded (Requirement 7.4). Non-invoice-shaped output
            // (e.g. the mock/demo) is skipped as a best-effort for mixed outputs.
            if (task == AiTask.DOCUMENT_EXTRACTION) {
                extractionValidator.validateInvoice(result.output());
            }

            // FinOps (task 7.2): provider_cost is computed here, in the application layer,
            // from a versioned price source — never in the Vertex adapter — so a price
            // change requires no code deploy (Requirements 11.1, 11.2, 11.4).
            BigDecimal cost = priceCatalog.providerCost(result.provider(), result.model(), result);

            String requestId = UUID.randomUUID().toString();
            ledger.record(org, userId, task, result, requestId, cost);
            // Outcome-aware observability (Req 9.2, 9.3): structured success log + a SUCCESS
            // ledger outcome. recordOutcome shares this transaction (committed on success).
            aiCallLogger.logSuccess(task, result);
            ledger.recordOutcome(new AiLedgerEntry(org, userId, task, requestId,
                    MDC.get("traceId"), AiOutcome.SUCCESS, null, result, cost));
            outbox.record(AGGREGATE_TYPE, requestId, org, "IaUtilizada", usagePayload(task, result));

            return new AnalysisView(task.name(), result.output(), result.provider(),
                    result.model(), result.inputUnits(), result.outputUnits(), result.ocrPages());
        } catch (RuntimeException ex) {
            // FAILURE outcome (Req 9.2): classify, log (redacted) and persist a FAILURE row in a
            // SEPARATE transaction so it survives the rollback caused by rethrowing. The exception
            // is rethrown unchanged so AiExceptionHandler still maps it to the correct HTTP status.
            String cat = AiFailureCategory.of(ex);
            aiCallLogger.logFailure(task, cat, ex);
            ledger.recordFailureOutcome(new AiLedgerEntry(org, userId, task,
                    UUID.randomUUID().toString(), MDC.get("traceId"), AiOutcome.FAILURE, cat, null, null));
            throw ex;
        }
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
        // Phase 0: keeps emitting the legacy metering signals only
        // (inputUnits/outputUnits/ocrPages). Real token telemetry
        // (promptTokens/outputTokens/thinkingTokens/totalTokens/finishReason/latencyMs)
        // is wired into the ledger/outbox in Phase 1 (tasks 3.2/3.3).
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
