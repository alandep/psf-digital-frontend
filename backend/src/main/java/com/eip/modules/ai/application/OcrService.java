package com.eip.modules.ai.application;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.ai.application.extraction.CommercialInvoiceDto;
import com.eip.modules.ai.application.extraction.InvoiceLineDto;
import com.eip.modules.ai.domain.model.AiExecutionPolicy;
import com.eip.modules.ai.domain.model.AiLedgerEntry;
import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiOutcome;
import com.eip.modules.ai.domain.model.AiPromptSpec;
import com.eip.modules.ai.domain.model.AiRequest;
import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.port.in.OcrExtractionUseCase;
import com.eip.modules.ai.domain.port.out.AiExecutionPolicyResolver;
import com.eip.modules.ai.domain.port.out.AiGatewayPort;
import com.eip.modules.ai.domain.port.out.AiPriceCatalogPort;
import com.eip.modules.ai.domain.port.out.AiPromptRegistry;
import com.eip.modules.ai.domain.port.out.AiUsageLedgerPort;
import com.eip.modules.ai.domain.port.out.QuotaPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

/**
 * Serviço de aplicação para a extração estruturada de documentos via OCR
 * multimodal. Espelha EXATAMENTE o pipeline de {@code AiHubService.analyze}:
 * resolve o modelo para a task fixa {@link AiTask#OCR_DOCUMENT}, confere a
 * franquia de IA do tenant, executa o gateway multimodal (lendo o binário do
 * object storage), valida a extração, mede o uso no ledger e registra o desfecho
 * — tudo em uma única transação. Em caso de falha, persiste o desfecho FAILURE
 * em transação separada e relança a exceção para o mapeamento HTTP correto
 * (Requisitos 17.3, 17.4, 17.6, 17.7, 17.9).
 */
@Service
@RequiredArgsConstructor
public class OcrService implements OcrExtractionUseCase {

    private static final String AGGREGATE_TYPE = "AiUsage";
    private static final String AI_FEATURE = "AI";
    /** Limiar de revisão humana: abaixo deste score a extração exige revisão. */
    private static final int REVIEW_THRESHOLD = 70;
    /** Número de campos-chave considerados no cálculo do score de completude. */
    private static final int KEY_FIELDS = 5;
    /** Tolerância na comparação entre a soma das linhas e o total declarado. */
    private static final BigDecimal AMOUNT_TOLERANCE = new BigDecimal("0.01");

    private final AiExecutionPolicyResolver policyResolver;
    private final AiPromptRegistry promptRegistry;
    private final AiGatewayPort gateway;
    private final ExtractionResultValidator extractionValidator;
    private final AiUsageLedgerPort ledger;
    private final AiPriceCatalogPort priceCatalog;
    private final QuotaPort quota;
    private final OutboxPublisher outbox;
    private final AiCallLogger aiCallLogger;
    private final ObjectMapper objectMapper;

    private static OrganizationContext ctx() {
        return OrganizationContextHolder.current();
    }

    @Override
    @Transactional
    public OcrExtractionView extract(OcrCommand cmd) {
        OrganizationContext context = ctx();
        UUID org = context.organizationId().value();
        UUID userId = context.userId();
        AiTask task = AiTask.OCR_DOCUMENT;

        if (!quota.hasRemaining(org, AI_FEATURE)) {
            throw new AiQuotaExceededException(
                    "Franquia de IA esgotada. Adquira creditos de IA para continuar.");
        }

        // Policy e prompt são resolvidos aqui, na camada de aplicação — nunca em
        // controllers e nunca no adapter do provedor (como no AiHubService).
        AiExecutionPolicy policy = policyResolver.resolve(task);
        AiModel model = policy.model();
        String inputText = "docKind=" + cmd.docKind();
        AiPromptSpec prompt = promptRegistry.specFor(task, inputText);
        AiRequest request = new AiRequest(task, inputText, org, userId);

        // O provedor lê o binário diretamente da URI de storage. Quando em cloud, o
        // storageKey já chega como URI completa (gs://bucket/key); caso contrário
        // (mock/local) o próprio storageKey é usado como referência.
        // TODO: no profile cloud o bucket vem de config; aqui aceitamos que o
        // storageKey já é a URI completa gs://bucket/key.
        String storageUri = cmd.storageKey();
        AiGatewayPort.StorageRef storageRef = new AiGatewayPort.StorageRef(storageUri, cmd.mediaType());

        try {
            AiResult result = gateway.runMultimodal(model, request, policy, prompt, storageRef);

            // A extração é validada ANTES de qualquer persistência: uma invoice
            // inválida lança erro aqui (→ 422), reusando o validador existente.
            extractionValidator.validateInvoice(result.output());

            // Desserializa a extração para compor a view e calcular a completude.
            CommercialInvoiceDto extraction = parseInvoice(result.output());
            int completenessScore = completenessScore(extraction);
            boolean needsReview = completenessScore < REVIEW_THRESHOLD;
            List<String> discrepancies = detectDiscrepancies(extraction);

            // FinOps: provider_cost é calculado aqui, na camada de aplicação, a
            // partir da fonte de preços versionada — nunca no adapter Vertex.
            BigDecimal cost = priceCatalog.providerCost(result.provider(), result.model(), result);

            String requestId = UUID.randomUUID().toString();
            ledger.record(org, userId, task, result, requestId, cost);
            aiCallLogger.logSuccess(task, result);
            ledger.recordOutcome(new AiLedgerEntry(org, userId, task, requestId,
                    MDC.get("traceId"), AiOutcome.SUCCESS, null, result, cost));
            outbox.record(AGGREGATE_TYPE, requestId, org, "IaUtilizada", usagePayload(task, result));

            return new OcrExtractionView(cmd.docKind(), extraction, completenessScore,
                    discrepancies, needsReview, result.provider(), result.model(), result.ocrPages());
        } catch (RuntimeException ex) {
            // Desfecho FAILURE: classifica, loga (redigido) e persiste a linha FAILURE
            // em transação SEPARADA para sobreviver ao rollback do relançamento. A
            // exceção é relançada inalterada para o AiExceptionHandler mapeá-la ao
            // status HTTP correto.
            String cat = AiFailureCategory.of(ex);
            aiCallLogger.logFailure(task, cat, ex);
            ledger.recordFailureOutcome(new AiLedgerEntry(org, userId, task,
                    UUID.randomUUID().toString(), MDC.get("traceId"), AiOutcome.FAILURE, cat, null, null));
            throw ex;
        }
    }

    private CommercialInvoiceDto parseInvoice(String output) {
        try {
            return objectMapper.readValue(output, CommercialInvoiceDto.class);
        } catch (com.fasterxml.jackson.core.JsonProcessingException ex) {
            // Não deveria ocorrer: validateInvoice já garantiu a forma de invoice.
            // Reusa a mesma exceção do validador existente (mapeada no AiExceptionHandler).
            throw new BusinessRuleException(
                    "Extracao de OCR invalida: JSON nao pode ser interpretado ("
                            + ex.getOriginalMessage() + ")");
        }
    }

    /**
     * Score de completude (0..100): razão de campos-chave presentes/não-nulos
     * sobre o total ({@value #KEY_FIELDS}) do {@link CommercialInvoiceDto}
     * (invoiceNumber, totalAmount, currency, incoterm, lines não-vazio),
     * multiplicada por 100. Determinístico e simples.
     */
    private int completenessScore(CommercialInvoiceDto dto) {
        int present = 0;
        if (dto.invoiceNumber() != null && !dto.invoiceNumber().isBlank()) {
            present++;
        }
        if (dto.totalAmount() != null) {
            present++;
        }
        if (dto.currency() != null && !dto.currency().isBlank()) {
            present++;
        }
        if (dto.incoterm() != null && !dto.incoterm().isBlank()) {
            present++;
        }
        if (dto.lines() != null && !dto.lines().isEmpty()) {
            present++;
        }
        return present * 100 / KEY_FIELDS;
    }

    /**
     * Detecta divergências de forma pragmática: linhas ausentes/vazias e, quando
     * há linhas, a soma de {@code quantity * unitPrice} comparada ao
     * {@code totalAmount} declarado (além da tolerância). Lista vazia quando tudo bate.
     */
    private List<String> detectDiscrepancies(CommercialInvoiceDto dto) {
        List<String> discrepancies = new ArrayList<>();
        if (dto.lines() == null || dto.lines().isEmpty()) {
            discrepancies.add("Documento sem linhas de itens.");
            return discrepancies;
        }
        BigDecimal linesTotal = BigDecimal.ZERO;
        for (InvoiceLineDto line : dto.lines()) {
            if (line.quantity() != null && line.unitPrice() != null) {
                linesTotal = linesTotal.add(line.quantity().multiply(line.unitPrice()));
            }
        }
        if (dto.totalAmount() != null
                && dto.totalAmount().subtract(linesTotal).abs().compareTo(AMOUNT_TOLERANCE) > 0) {
            discrepancies.add("Valor total diverge da soma das linhas.");
        }
        return discrepancies;
    }

    private static String usagePayload(AiTask task, AiResult result) {
        return "{\"task\":\"" + task.name()
                + "\",\"provider\":\"" + result.provider()
                + "\",\"model\":\"" + result.model()
                + "\",\"inputUnits\":" + result.inputUnits()
                + ",\"outputUnits\":" + result.outputUnits()
                + ",\"ocrPages\":" + result.ocrPages() + "}";
    }
}
