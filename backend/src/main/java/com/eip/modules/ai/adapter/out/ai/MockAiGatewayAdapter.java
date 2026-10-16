package com.eip.modules.ai.adapter.out.ai;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.eip.modules.ai.domain.model.AiExecutionPolicy;
import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiPromptSpec;
import com.eip.modules.ai.domain.model.AiRequest;
import com.eip.modules.ai.domain.model.AiResult;

/**
 * DEV / mock provider gateway. Returns deterministic results so the front's
 * aiOperations mock and the document-analysis flow work without a real API.
 *
 * <p>Metering signals ({@code inputUnits}/{@code outputUnits}) are derived from
 * the input length; {@code ocrPages} is 0. The provider/model come from the
 * {@link AiModel} the router resolved — they are configuration, never hardcoded
 * in the domain.
 *
 * <p>TODO: replace with a Vertex AI adapter active in the cloud profile. The
 * router picks provider/model and this adapter calls the real API. This bean is
 * active in every profile except {@code cloud}; the real
 * Vertex adapter will be annotated {@code @Profile("cloud")} to replace it.
 */
@Component
@Profile("!cloud")
public class MockAiGatewayAdapter implements com.eip.modules.ai.domain.port.out.AiGatewayPort {

    /**
     * Deterministic invoice extraction JSON compatible with the OCR/extraction
     * (INVOICE) schema. Shared by {@code OCR_DOCUMENT}, {@code DOCUMENT_EXTRACTION}
     * and {@link #runMultimodal} so the structured output parser accepts the mock.
     */
    private static final String MOCK_INVOICE_JSON =
            "{\"invoiceNumber\":\"INV-2024-0001\",\"totalAmount\":4500,\"currency\":\"USD\","
                    + "\"incoterm\":\"FOB\",\"lines\":[{\"sku\":\"CAFE-AR\",\"quantity\":1000,\"unitPrice\":4.5}]}";

    @Override
    public AiResult run(AiModel model, AiRequest request, AiExecutionPolicy policy, AiPromptSpec prompt) {
        String input = request.input() != null ? request.input() : "";
        long promptTokens = Math.max(1, input.length());
        String output = switch (request.task()) {
            case NCM_CLASSIFICATION -> "{\"ncm\":\"0901.11.10\",\"confidence\":0.93,"
                    + "\"rationale\":\"Café não torrado (mock).\","
                    + "\"alternatives\":[{\"ncm\":\"0901.21.00\",\"confidence\":0.4,\"reason\":\"Se torrado\"}]}";
            case DOCUMENT_SUMMARY -> "Resumo: " + truncate(input, 120);
            case TRANSLATION -> "Traducao (mock): " + truncate(input, 200);
            case RISK_ANALYSIS -> "Analise de risco (mock): risco moderado.";
            case DOCUMENT_EXTRACTION -> MOCK_INVOICE_JSON;
            case CHAT -> "Resposta (mock): " + truncate(input, 200);
            case TRANSPORT_SIMULATION -> "{\"carrier\":\"Transportadora Mock\",\"modal\":\"Rodoviário\","
                    + "\"route\":\"Origem → Destino\",\"rationale\":\"Melhor custo/prazo (mock).\","
                    + "\"estimatedTransitDays\":4,\"estimatedCost\":12500}";
            case EXPORT_NL_CREATION -> "{\"incoterm\":\"FOB\",\"origin\":\"Rondonópolis - MT\","
                    + "\"destination\":\"Hamburgo - Alemanha\",\"product\":\"Café verde\","
                    + "\"ncm\":\"0901.11.10\",\"quantity\":1000,\"unit\":\"KG\",\"notes\":\"Rascunho (mock).\"}";
            case OCR_DOCUMENT -> MOCK_INVOICE_JSON;
        };
        long outputTokens = Math.max(1, output.length());
        return AiResult.of(output, model.provider(), model.model(), 0,
                promptTokens, outputTokens, 0, promptTokens + outputTokens, "STOP", 0);
    }

    @Override
    public AiResult runMultimodal(AiModel model, AiRequest request, AiExecutionPolicy policy,
                                  AiPromptSpec prompt, StorageRef storageRef) {
        String input = request.input() != null ? request.input() : "";
        long promptTokens = Math.max(1, input.length());
        String output = MOCK_INVOICE_JSON;
        long outputTokens = Math.max(1, output.length());
        return AiResult.of(output, model.provider(), model.model(), 2 /* ocrPages */,
                promptTokens, outputTokens, 0, promptTokens + outputTokens, "STOP", 0);
    }

    private static String truncate(String value, int max) {
        if (value.length() <= max) {
            return value;
        }
        return value.substring(0, max);
    }
}
