package com.eip.modules.ai.application;

import com.eip.modules.ai.domain.model.AiPromptSpec;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.port.out.AiPromptRegistry;
import org.springframework.stereotype.Component;

/**
 * Default, deterministic {@link AiPromptRegistry}.
 *
 * <p>All business prompts live here, in the application layer — NOT in the Vertex
 * gateway adapter. That keeps the provider adapter business-agnostic: it never
 * needs to know what an NCM, invoice or packing list is; it only receives a
 * fully built {@link AiPromptSpec} (Requirements 6.1, 6.2, 6.3, 6.4).
 *
 * <p>This component is pure and deterministic: no external calls, just a switch
 * over {@link AiTask}. It is profile-agnostic (no {@code @Profile}) and inert
 * until {@code AiHubService} wires it in (task 5.8).
 */
@Component
public class DefaultAiPromptRegistry implements AiPromptRegistry {

    /**
     * OpenAPI-style JSON schema for {@code DOCUMENT_EXTRACTION}, mirroring the
     * {@link com.eip.modules.ai.application.extraction.CommercialInvoiceDto} shape
     * (invoiceNumber, totalAmount, currency, incoterm and the lines[] of
     * {sku, quantity, unitPrice}). Passed through to the provider as
     * {@code responseSchema} so Gemini returns structured JSON that the extraction
     * validator can parse and validate (task 9.2, Requirement 7.1).
     */
    private static final String INVOICE_RESPONSE_SCHEMA = """
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

    /**
     * OpenAPI-style JSON schema for {@code NCM_CLASSIFICATION}. Forces Vertex to
     * return structured JSON (ncm, confidence, rationale and the alternatives[]
     * of {ncm, confidence, reason}) instead of a bare NCM code string. Passed
     * through to the provider as {@code responseSchema} so {@code StructuredOutputParser}
     * can parse/validate it into an {@code NcmClassification} (task 3.1, Requirements 14.2, 14.3).
     */
    private static final String NCM_RESPONSE_SCHEMA = """
            {
              "type": "object",
              "properties": {
                "ncm": { "type": "string" },
                "confidence": { "type": "number" },
                "rationale": { "type": "string" },
                "alternatives": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "ncm": { "type": "string" },
                      "confidence": { "type": "number" },
                      "reason": { "type": "string" }
                    },
                    "required": ["ncm", "confidence", "reason"]
                  }
                }
              },
              "required": ["ncm", "confidence", "rationale", "alternatives"]
            }""";

    /**
     * OpenAPI-style JSON schema for {@code TRANSPORT_SIMULATION}. Forces Vertex
     * to return structured JSON (carrier, modal, route, rationale and the
     * optional estimatedTransitDays/estimatedCost) instead of free text. Passed
     * through to the provider as {@code responseSchema} so {@code StructuredOutputParser}
     * can parse/validate it into a {@code TransportSimulation} (task 5.2, Requirements 15.2, 15.3).
     */
    private static final String TRANSPORT_RESPONSE_SCHEMA = """
            {
              "type": "object",
              "properties": {
                "carrier": { "type": "string" },
                "modal": { "type": "string" },
                "route": { "type": "string" },
                "rationale": { "type": "string" },
                "estimatedTransitDays": { "type": "integer" },
                "estimatedCost": { "type": "number" }
              },
              "required": ["carrier", "modal", "route", "rationale"]
            }""";

    /**
     * OpenAPI-style JSON schema for {@code EXPORT_NL_CREATION}. Forces Vertex to
     * return a structured export draft (incoterm, origin, destination, product,
     * optional ncm, quantity, unit and notes) from a natural-language command.
     * Passed through to the provider as {@code responseSchema} so
     * {@code StructuredOutputParser} can parse/validate it into an
     * {@code ExportDraft} for human review (task 7.2, Requirements 16.2, 16.3).
     */
    private static final String EXPORT_NL_RESPONSE_SCHEMA = """
            {
              "type": "object",
              "properties": {
                "incoterm": { "type": "string" },
                "origin": { "type": "string" },
                "destination": { "type": "string" },
                "product": { "type": "string" },
                "ncm": { "type": "string" },
                "quantity": { "type": "number" },
                "unit": { "type": "string" },
                "notes": { "type": "string" }
              },
              "required": ["incoterm", "origin", "destination", "product", "quantity", "unit"]
            }""";

    @Override
    public AiPromptSpec specFor(AiTask task, String input) {
        String safeInput = input != null ? input : "";
        String version = promptVersion(task);
        return switch (task) {
            case NCM_CLASSIFICATION -> new AiPromptSpec(
                    "Você é um classificador fiscal. Classifique o produto na NCM e devolva "
                            + "o código, a confiança (0 a 1), uma justificativa concisa e as "
                            + "alternativas plausíveis. Responda em pt-BR, de forma objetiva.",
                    "Classifique a NCM do produto a seguir, informando código, confiança, "
                            + "justificativa e alternativas:\n" + safeInput,
                    // Structured JSON schema (ncm, confidence, rationale, alternatives[]).
                    // When present, the Vertex adapter sets responseMimeType=application/json
                    // + responseSchema so the provider returns structured JSON that
                    // StructuredOutputParser can parse/validate (task 3.1).
                    NCM_RESPONSE_SCHEMA,
                    version);
            case DOCUMENT_SUMMARY -> new AiPromptSpec(
                    "Você resume documentos de comércio exterior.",
                    "Resuma o documento a seguir:\n" + safeInput,
                    null,
                    version);
            case TRANSLATION -> new AiPromptSpec(
                    "Você é um tradutor técnico.",
                    "Traduza o texto a seguir:\n" + safeInput,
                    null,
                    version);
            case RISK_ANALYSIS -> new AiPromptSpec(
                    "Você analisa riscos de operações de exportação.",
                    "Analise os riscos no conteúdo a seguir:\n" + safeInput,
                    null,
                    version);
            case DOCUMENT_EXTRACTION -> new AiPromptSpec(
                    "Você extrai dados estruturados de documentos de comércio exterior.",
                    "Extraia os dados estruturados do documento a seguir:\n" + safeInput,
                    // Response JSON schema mirroring CommercialInvoiceDto (task 9.2).
                    // When present, the Vertex adapter sets responseMimeType=application/json
                    // + responseSchema so the provider returns structured JSON.
                    INVOICE_RESPONSE_SCHEMA,
                    version);
            case CHAT -> new AiPromptSpec(
                    null,
                    safeInput,
                    null,
                    version);
            case TRANSPORT_SIMULATION -> new AiPromptSpec(
                    "Você é um especialista em logística de exportação. Recomende a melhor "
                            + "transportadora, modal e rota para a operação informada, com "
                            + "justificativa objetiva. Responda em pt-BR, de forma objetiva.",
                    "Com base nos dados de transporte a seguir, recomende a melhor opção "
                            + "(transportadora, modal, rota) com justificativa e, quando possível, "
                            + "prazo e custo estimados:\n" + safeInput,
                    // Structured JSON schema (carrier, modal, route, rationale,
                    // estimatedTransitDays?, estimatedCost?). When present, the Vertex
                    // adapter sets responseMimeType=application/json + responseSchema so
                    // the provider returns structured JSON that StructuredOutputParser
                    // can parse/validate (task 5.2).
                    TRANSPORT_RESPONSE_SCHEMA,
                    version);
            case EXPORT_NL_CREATION -> new AiPromptSpec(
                    "Você é um assistente que estrutura uma operação de exportação a partir "
                            + "de um comando em linguagem natural. Responda em pt-BR e deixe "
                            + "claro que o resultado é um rascunho para revisão humana.",
                    "Estruture um rascunho de exportação a partir do comando em linguagem "
                            + "natural a seguir, preenchendo os campos conhecidos:\n" + safeInput,
                    // Structured JSON schema (incoterm, origin, destination, product,
                    // ncm?, quantity, unit, notes). When present, the Vertex adapter sets
                    // responseMimeType=application/json + responseSchema so the provider
                    // returns structured JSON that StructuredOutputParser can
                    // parse/validate into an ExportDraft for human review (task 7.2).
                    EXPORT_NL_RESPONSE_SCHEMA,
                    version);
            case OCR_DOCUMENT -> new AiPromptSpec(
                    "Você extrai dados estruturados de documentos digitalizados de comércio exterior (OCR).",
                    "Extraia os dados estruturados do documento anexado:\n" + safeInput,
                    // Same shape as DOCUMENT_EXTRACTION (invoiceNumber, totalAmount,
                    // currency, incoterm, lines[sku, quantity, unitPrice]): OCR reads
                    // the same invoice/packing fields. The binary content is read by
                    // the provider via fileData; this text is instruction/complement.
                    // When present, the Vertex adapter sets responseMimeType=application/json
                    // + responseSchema so the provider returns structured JSON (task 10.4).
                    INVOICE_RESPONSE_SCHEMA,
                    version);
        };
    }

    @Override
    public String promptVersion(AiTask task) {
        // NCM moved to a structured JSON schema (task 3.2); bump the version so any
        // cached entry keyed by the old v1 prompt is invalidated.
        if (task == AiTask.NCM_CLASSIFICATION) {
            return "v2-ncm_classification";
        }
        return "v1-" + task.name().toLowerCase();
    }
}
