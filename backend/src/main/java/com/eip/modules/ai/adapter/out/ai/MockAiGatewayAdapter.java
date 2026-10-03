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

    @Override
    public AiResult run(AiModel model, AiRequest request, AiExecutionPolicy policy, AiPromptSpec prompt) {
        String input = request.input() != null ? request.input() : "";
        long promptTokens = Math.max(1, input.length());
        String output = switch (request.task()) {
            case NCM_CLASSIFICATION -> "0901.21.00";
            case DOCUMENT_SUMMARY -> "Resumo: " + truncate(input, 120);
            case TRANSLATION -> "Traducao (mock): " + truncate(input, 200);
            case RISK_ANALYSIS -> "Analise de risco (mock): risco moderado.";
            case DOCUMENT_EXTRACTION -> "{\"campos\":{},\"texto\":\"" + truncate(input, 80) + "\"}";
            case CHAT -> "Resposta (mock): " + truncate(input, 200);
        };
        long outputTokens = Math.max(1, output.length());
        return AiResult.of(output, model.provider(), model.model(), 0,
                promptTokens, outputTokens, 0, promptTokens + outputTokens, "STOP", 0);
    }

    private static String truncate(String value, int max) {
        if (value.length() <= max) {
            return value;
        }
        return value.substring(0, max);
    }
}
