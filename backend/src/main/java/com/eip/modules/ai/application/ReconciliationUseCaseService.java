package com.eip.modules.ai.application;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.ai.application.extraction.CommercialInvoiceDto;
import com.eip.modules.ai.application.extraction.PackingListDto;
import com.eip.modules.ai.application.extraction.PedidoDto;
import com.eip.modules.ai.application.reconciliation.DivergenceExplanationService;
import com.eip.modules.ai.application.reconciliation.DocKind;
import com.eip.modules.ai.application.reconciliation.DocumentExtractionResult;
import com.eip.modules.ai.application.reconciliation.DocumentReconciliationService;
import com.eip.modules.ai.application.reconciliation.ReconciliationResponse;
import com.eip.modules.ai.application.reconciliation.ReconciliationResult;
import com.eip.modules.ai.application.reconciliation.ReviewOutcome;
import com.eip.modules.ai.application.reconciliation.ReviewReason;
import com.eip.modules.ai.domain.error.AiProviderException;
import com.eip.modules.ai.domain.error.AiResponseException;
import com.eip.modules.ai.domain.model.AiExecutionPolicy;
import com.eip.modules.ai.domain.model.AiLedgerEntry;
import com.eip.modules.ai.domain.model.AiOutcome;
import com.eip.modules.ai.domain.model.AiPromptSpec;
import com.eip.modules.ai.domain.model.AiRequest;
import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.port.out.AiExecutionPolicyResolver;
import com.eip.modules.ai.domain.port.out.AiGatewayPort;
import com.eip.modules.ai.domain.port.out.AiPriceCatalogPort;
import com.eip.modules.ai.domain.port.out.AiUsageLedgerPort;
import com.eip.modules.ai.domain.port.out.QuotaPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;

/**
 * Caso de uso que exercita o fluxo <strong>Pedido × Packing List × Commercial
 * Invoice</strong> de ponta a ponta.
 *
 * <p><strong>Divisão de responsabilidades IA × Java:</strong>
 * <ul>
 *   <li>A IA (Gemini via {@link AiGatewayPort}) é usada <em>apenas</em> para
 *       <strong>extrair</strong> os três documentos em DTOs estruturados
 *       (JSON conforme schema) e, numa etapa separada, para <strong>explicar</strong>
 *       divergências já detectadas ({@link DivergenceExplanationService}).</li>
 *   <li>A <strong>decisão de igualdade numérica</strong> (moeda, Incoterm,
 *       quantidade por SKU, total) é 100% Java, feita pelo
 *       {@link DocumentReconciliationService}. A IA nunca decide se dois valores
 *       são iguais.</li>
 * </ul>
 *
 * <p>Sem mock, sem fallback silencioso e sem resultado de reconciliação
 * hardcoded: as três extrações passam pelo gateway real e são parseadas +
 * validadas (Bean Validation) antes da reconciliação determinística.
 */
@Service
@RequiredArgsConstructor
public class ReconciliationUseCaseService {

    private static final String AI_FEATURE = "AI";

    private static final String EXTRACTION_SYSTEM_INSTRUCTION =
            "Você extrai dados estruturados de documentos de comércio exterior. "
                    + "Responda SOMENTE com JSON conforme o schema.";

    /**
     * Schema JSON (estilo OpenAPI) espelhando {@link PedidoDto}: cabeçalho
     * (pedidoNumber, currency, incoterm, totalAmount) e lines[] de {sku, quantity}.
     */
    private static final String PEDIDO_SCHEMA = """
            {
              "type": "object",
              "properties": {
                "pedidoNumber": { "type": "string" },
                "currency": { "type": "string" },
                "incoterm": { "type": "string" },
                "totalAmount": { "type": "number" },
                "lines": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "sku": { "type": "string" },
                      "quantity": { "type": "number" }
                    },
                    "required": ["sku", "quantity"]
                  }
                }
              },
              "required": ["pedidoNumber", "currency", "incoterm", "totalAmount", "lines"]
            }""";

    /**
     * Schema JSON (estilo OpenAPI) espelhando {@link PackingListDto}: cabeçalho
     * (reference, totalGrossWeightKg, totalNetWeightKg) e lines[] de
     * {sku, quantity, grossWeightKg, netWeightKg}.
     */
    private static final String PACKING_SCHEMA = """
            {
              "type": "object",
              "properties": {
                "reference": { "type": "string" },
                "totalGrossWeightKg": { "type": "number" },
                "totalNetWeightKg": { "type": "number" },
                "lines": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "sku": { "type": "string" },
                      "quantity": { "type": "number" },
                      "grossWeightKg": { "type": "number" },
                      "netWeightKg": { "type": "number" }
                    },
                    "required": ["sku", "quantity", "grossWeightKg", "netWeightKg"]
                  }
                }
              },
              "required": ["reference", "totalGrossWeightKg", "totalNetWeightKg", "lines"]
            }""";

    /**
     * Schema JSON (estilo OpenAPI) espelhando {@link CommercialInvoiceDto}:
     * cabeçalho (invoiceNumber, totalAmount, currency, incoterm) e lines[] de
     * {sku, quantity, unitPrice}. Replica o schema já existente no
     * {@code DefaultAiPromptRegistry}.
     */
    private static final String INVOICE_SCHEMA = """
            {
              "type": "object",
              "properties": {
                "invoiceNumber": { "type": "string" },
                "totalAmount": { "type": "number" },
                "currency": { "type": "string" },
                "incoterm": { "type": "string" },
                "lines": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "sku": { "type": "string" },
                      "quantity": { "type": "number" },
                      "unitPrice": { "type": "number" }
                    },
                    "required": ["sku", "quantity", "unitPrice"]
                  }
                }
              },
              "required": ["invoiceNumber", "totalAmount", "currency", "incoterm", "lines"]
            }""";

    private final AiGatewayPort gateway;
    private final AiExecutionPolicyResolver policyResolver;
    private final DocumentReconciliationService reconciliationService;
    private final DivergenceExplanationService explanationService;
    private final AiUsageLedgerPort ledger;
    private final AiPriceCatalogPort priceCatalog;
    private final QuotaPort quota;
    private final ObjectMapper objectMapper;
    private final Validator validator;
    private final AiCallLogger aiCallLogger;

    /**
     * Visão agregada do fluxo de reconciliação, com os três documentos extraídos,
     * o veredito determinístico ({@code ok}), as divergências detectadas (detalhes
     * legíveis) e a explicação (produzida pela IA quando há divergências).
     *
     * @param pedido      pedido extraído pela IA
     * @param packing     packing list extraído pela IA
     * @param invoice     commercial invoice extraída pela IA
     * @param ok          veredito determinístico (sem divergências)
     * @param divergences detalhes legíveis das divergências (ordem determinística)
     * @param explanation explicação das divergências (fixa quando {@code ok})
     */
    public record ReconciliationView(
            PedidoDto pedido,
            PackingListDto packing,
            CommercialInvoiceDto invoice,
            boolean ok,
            List<String> divergences,
            String explanation) {
    }

    /**
     * Executa o fluxo completo: extrai os três documentos via IA (capturando falha
     * por documento, sem abortar tudo), reconcilia em Java puro quando os três estão
     * OK e computa o encaminhamento para revisão humana por sinais determinísticos.
     *
     * <p>As três extrações são sempre tentadas — a falha de <em>conteúdo/validação</em>
     * de uma ({@link AiResponseException}/{@link BusinessRuleException}) é capturada em
     * {@link DocumentExtractionResult#failed} em vez de interromper as demais. Falhas de
     * <strong>transporte</strong> (timeout/503/429, modeladas como
     * {@code AiProviderException}) <strong>não</strong> são capturadas aqui: elas
     * propagam e fazem a requisição inteira falhar com o status transiente apropriado.</p>
     *
     * @param pedidoText  texto bruto do Pedido
     * @param packingText texto bruto do Packing List
     * @param invoiceText texto bruto da Commercial Invoice
     * @return resposta agregada explícita por documento, com reconciliação (quando os
     *         três OK) e o desfecho determinístico de revisão
     */
    @Transactional
    public ReconciliationResponse reconcile(String pedidoText, String packingText, String invoiceText) {
        OrganizationContext context = OrganizationContextHolder.current();
        UUID org = context.organizationId().value();
        UUID userId = context.userId();

        if (!quota.hasRemaining(org, AI_FEATURE)) {
            throw new AiQuotaExceededException(
                    "Franquia de IA esgotada. Adquira creditos de IA para continuar.");
        }

        // Extração via IA (Gemini) — real, para os três documentos. Cada falha de
        // conteúdo/validação é capturada por documento (as demais seguem adiante).
        DocumentExtractionResult<PedidoDto> pedido = extractDoc(DocKind.PEDIDO, pedidoText, PEDIDO_SCHEMA,
                "v1-pedido-extraction", PedidoDto.class, org, userId);
        DocumentExtractionResult<PackingListDto> packing = extractDoc(DocKind.PACKING, packingText, PACKING_SCHEMA,
                "v1-packing-extraction", PackingListDto.class, org, userId);
        DocumentExtractionResult<CommercialInvoiceDto> invoice = extractDoc(DocKind.INVOICE, invoiceText,
                INVOICE_SCHEMA, "v1-invoice-extraction", CommercialInvoiceDto.class, org, userId);

        boolean allExtracted = ReconciliationResponse.computeAllExtracted(pedido, packing, invoice);

        // Sinais determinísticos de revisão humana (NUNCA um score de confiança fabricado).
        List<ReviewReason> reasons = new ArrayList<>();
        ReconciliationView reconciliationView = null;

        if (!allExtracted) {
            // Ao menos um documento FAILED → reconciliação não roda; resposta explícita.
            // Nota: finishReason != STOP já foi convertido em AiResponseException(TRUNCATED/
            // BLOCKED_SAFETY) no gateway e, portanto, surge aqui como documento FAILED — ou seja,
            // no nível da reconciliação ele se manifesta como PARTIAL_EXTRACTION. Não
            // dupli-sinalizamos FINISH_REASON_NOT_STOP neste ponto (no caminho /analisar singular
            // a mesma falha surge como 422 AI_RESPONSE_INVALID).
            reasons.add(ReviewReason.PARTIAL_EXTRACTION);
        } else {
            // Decisão de igualdade numérica: 100% Java, determinística.
            ReconciliationResult rr = reconciliationService.reconcile(pedido.dto(), packing.dto(), invoice.dto());

            // A IA apenas EXPLICA divergências já detectadas (mensagem fixa quando ok()).
            String explanation = explanationService.explain(org, rr);

            List<String> divergences = rr.divergences().stream()
                    .map(d -> d.detail())
                    .toList();

            reconciliationView = new ReconciliationView(
                    pedido.dto(), packing.dto(), invoice.dto(), rr.ok(), divergences, explanation);

            if (!rr.ok()) {
                reasons.add(ReviewReason.RECONCILIATION_DIVERGENCE);
            }

            // TODO: quando uma re-validação de regra de negócio determinística (além da Bean
            // Validation) for adicionada, acrescentar ReviewReason.REVALIDATION_FAILED aqui ao
            // detectar um DTO que passou no schema mas falhou na regra. Não fabricar hoje.
        }

        return new ReconciliationResponse(pedido, packing, invoice, allExtracted, reconciliationView,
                ReviewOutcome.of(reasons));
    }

    /**
     * Envolve {@link #extract} capturando falhas de <strong>conteúdo/validação</strong>
     * específicas de um documento, convertendo-as em {@link DocumentExtractionResult#failed}
     * em vez de abortar a requisição inteira.
     *
     * <p>Captura apenas {@link AiResponseException} (falha de conteúdo da resposta) e
     * {@link BusinessRuleException} (parse/schema inválidos vindos de {@link #extract},
     * tratados como {@link AiResponseException.Kind#SCHEMA_INVALID}). Falhas de transporte
     * ({@code AiProviderException}: timeout/503/429) <strong>não</strong> são capturadas e
     * propagam para falhar a requisição inteira com o status transiente apropriado.</p>
     *
     * @param kind          tipo do documento
     * @param docText       texto bruto do documento
     * @param schema        schema JSON de resposta espelhando o DTO
     * @param promptVersion versão do prompt (participa da telemetria)
     * @param dtoType       tipo-alvo da extração
     * @param org           tenant dono da requisição
     * @param userId        usuário solicitante (pode ser {@code null})
     * @param <T>           tipo do DTO extraído
     * @return {@code ok(kind, dto)} em sucesso; {@code failed(kind, kind, detalhe redigido)}
     *         em falha de conteúdo/validação
     */
    private <T> DocumentExtractionResult<T> extractDoc(DocKind kind, String docText, String schema,
            String promptVersion, Class<T> dtoType, UUID org, UUID userId) {
        try {
            T dto = extract(docText, schema, promptVersion, dtoType, org, userId);
            return DocumentExtractionResult.ok(kind, dto);
        } catch (AiResponseException e) {
            // Falha de conteúdo específica do documento: registra desfecho FAILURE + log redigido
            // (Req 9.2, 9.3) e segue com os demais documentos (não aborta a requisição inteira).
            recordDocumentFailure(org, userId, e);
            return DocumentExtractionResult.failed(kind, e.kind(), redact(e.getMessage()));
        } catch (BusinessRuleException e) {
            // Parse/schema inválidos de extract(...) são falhas de conteúdo específicas do documento.
            recordDocumentFailure(org, userId, e);
            return DocumentExtractionResult.failed(kind, AiResponseException.Kind.SCHEMA_INVALID,
                    redact(e.getMessage()));
        } catch (AiProviderException e) {
            // Falha de TRANSPORTE (timeout/503/429): registra o desfecho FAILURE + log redigido e
            // RELANÇA, para que a requisição inteira falhe com o status transiente apropriado
            // (AiExceptionHandler mapeia o status). O FAILURE é persistido em transação separada.
            String cat = AiFailureCategory.of(e);
            aiCallLogger.logFailure(AiTask.DOCUMENT_EXTRACTION, cat, e);
            ledger.recordFailureOutcome(new AiLedgerEntry(org, userId, AiTask.DOCUMENT_EXTRACTION,
                    UUID.randomUUID().toString(), MDC.get("traceId"), AiOutcome.FAILURE, cat, null, null));
            throw e;
        }
    }

    /**
     * Registra o desfecho FAILURE de uma falha de conteúdo/validação específica de um documento:
     * log estruturado redigido (Req 9.3) + linha FAILURE no ledger em transação separada (Req 9.2),
     * sem relançar — a captura por documento preserva as demais extrações.
     *
     * @param org    tenant dono da requisição
     * @param userId usuário solicitante (pode ser {@code null})
     * @param ex     a falha de conteúdo/validação do documento
     */
    private void recordDocumentFailure(UUID org, UUID userId, RuntimeException ex) {
        String cat = AiFailureCategory.of(ex);
        aiCallLogger.logFailure(AiTask.DOCUMENT_EXTRACTION, cat, ex);
        ledger.recordFailureOutcome(new AiLedgerEntry(org, userId, AiTask.DOCUMENT_EXTRACTION,
                UUID.randomUUID().toString(), MDC.get("traceId"), AiOutcome.FAILURE, cat, null, null));
    }

    /**
     * Redige uma mensagem de falha para exposição segura: apara e limita o tamanho.
     *
     * <p>As mensagens de {@link #extract} já contêm apenas o tipo do DTO e os caminhos de
     * violação (nunca o texto integral do documento), então basta aparar e truncar.</p>
     *
     * @param msg mensagem técnica original (pode ser {@code null})
     * @return mensagem aparada e limitada a ~300 caracteres (nunca {@code null})
     */
    private String redact(String msg) {
        if (msg == null) {
            return "";
        }
        String trimmed = msg.trim();
        return trimmed.length() > 300 ? trimmed.substring(0, 300) : trimmed;
    }

    /**
     * Extrai um documento em um DTO estruturado via o gateway de IA real, medindo
     * o uso no ledger (FinOps) e validando o resultado (JSON + Bean Validation)
     * antes de devolvê-lo. Nenhum mock, nenhum fallback.
     *
     * @param docText            texto bruto do documento
     * @param responseSchemaJson schema JSON de resposta espelhando o DTO
     * @param promptVersion      versão do prompt (participa da telemetria)
     * @param dtoType            tipo-alvo da extração
     * @param org                tenant dono da requisição
     * @param userId             usuário solicitante (pode ser {@code null})
     * @param <T>                tipo do DTO extraído
     * @return o DTO extraído, parseado e validado
     */
    private <T> T extract(String docText, String responseSchemaJson, String promptVersion,
            Class<T> dtoType, UUID org, UUID userId) {
        AiExecutionPolicy policy = policyResolver.resolve(AiTask.DOCUMENT_EXTRACTION);

        AiPromptSpec prompt = new AiPromptSpec(
                EXTRACTION_SYSTEM_INSTRUCTION,
                "Extraia os dados do documento a seguir:\n" + docText,
                responseSchemaJson,
                promptVersion);

        AiRequest req = new AiRequest(AiTask.DOCUMENT_EXTRACTION, docText, org, userId);
        AiResult r = gateway.run(policy.model(), req, policy, prompt);

        // Validar ANTES de registrar: nunca medir/persistir uma extração inválida (invariante R2.8).
        T dto;
        try {
            dto = objectMapper.readValue(r.output(), dtoType);
        } catch (JsonProcessingException ex) {
            throw new BusinessRuleException(
                    "Extração inválida (" + dtoType.getSimpleName()
                            + "): JSON não pôde ser interpretado");
        }

        Set<ConstraintViolation<T>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            String detail = violations.stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .sorted()
                    .collect(Collectors.joining("; "));
            throw new BusinessRuleException(
                    "Extração inválida (" + dtoType.getSimpleName() + "): " + detail);
        }

        // FinOps: custo computado na camada de aplicação a partir da fonte versionada.
        // Só medimos/registramos APÓS o DTO ser considerado válido.
        BigDecimal cost = priceCatalog.providerCost(r.provider(), r.model(), r);
        String requestId = UUID.randomUUID().toString();
        ledger.record(org, userId, AiTask.DOCUMENT_EXTRACTION, r, requestId, cost);
        // Observabilidade por chamada (Req 9.2, 9.3): log de sucesso + desfecho SUCCESS. O
        // recordOutcome compartilha a transação do chamador (confirma junto no sucesso).
        aiCallLogger.logSuccess(AiTask.DOCUMENT_EXTRACTION, r);
        ledger.recordOutcome(new AiLedgerEntry(org, userId, AiTask.DOCUMENT_EXTRACTION, requestId,
                MDC.get("traceId"), AiOutcome.SUCCESS, null, r, cost));

        return dto;
    }
}
