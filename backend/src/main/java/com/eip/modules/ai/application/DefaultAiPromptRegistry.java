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

    @Override
    public AiPromptSpec specFor(AiTask task, String input) {
        String safeInput = input != null ? input : "";
        String version = promptVersion(task);
        return switch (task) {
            case NCM_CLASSIFICATION -> new AiPromptSpec(
                    "Você é um classificador fiscal. Responda apenas o código NCM.",
                    "Classifique o NCM do seguinte produto:\n" + safeInput,
                    null,
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
        };
    }

    @Override
    public String promptVersion(AiTask task) {
        return "v1-" + task.name().toLowerCase();
    }
}
