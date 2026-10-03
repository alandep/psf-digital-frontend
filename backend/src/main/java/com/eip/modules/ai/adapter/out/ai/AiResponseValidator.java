package com.eip.modules.ai.adapter.out.ai;

import org.springframework.stereotype.Component;

import com.eip.modules.ai.domain.error.AiResponseException;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Verifica a <strong>completude</strong> da resposta do provedor de IA (Vertex /
 * Gemini) <em>antes</em> do mapeamento de telemetria ({@link AiTelemetryMapper})
 * e do parse de negócio.
 *
 * <p>Endurece o caminho de IA fechando a lacuna em que o {@code AiTelemetryMapper}
 * lê {@code candidates[0].finishReason} e {@code usageMetadata} mas <em>não</em>
 * trata {@code finishReason != STOP}, {@code candidates} vazio nem output
 * vazio/truncado como falha. Quando a resposta não é utilizável, lança
 * {@link AiResponseException} (mapeada para 422 {@code AI_RESPONSE_INVALID} pelo
 * handler), garantindo que um resultado inválido <strong>nunca</strong> seja
 * mapeado ou persistido silenciosamente.
 *
 * <p><strong>Escopo:</strong> valida apenas completude de transporte/conteúdo da
 * resposta — <em>não</em> valida o schema de negócio. A validação de schema de
 * negócio continua no {@code ExtractionResultValidator} / Bean Validation
 * (também → 422). Esta classe é lógica pura de {@link JsonNode}; embora registrada
 * como {@code @Component} global, só é invocada pelo {@link VertexAiGatewayAdapter}
 * (profile {@code cloud}), permanecendo inerte nos demais profiles.
 */
@Component
public class AiResponseValidator {

    /**
     * Valida que a resposta do provedor está completa e utilizável.
     *
     * <p>Regras (determinísticas):
     * <ul>
     *   <li>{@code candidates} ausente/não-array/vazio → {@link AiResponseException.Kind#EMPTY_OUTPUT}.</li>
     *   <li>{@code finishReason == MAX_TOKENS} → {@link AiResponseException.Kind#TRUNCATED}.</li>
     *   <li>{@code finishReason == SAFETY | RECITATION} → {@link AiResponseException.Kind#BLOCKED_SAFETY}.</li>
     *   <li>{@code finishReason} não-nulo, {@code != STOP} e distinto dos acima →
     *       {@link AiResponseException.Kind#TRUNCATED}.</li>
     *   <li>output concatenado em branco → {@link AiResponseException.Kind#EMPTY_OUTPUT}.</li>
     * </ul>
     *
     * @param response o corpo JSON já parseado da resposta do provedor
     * @throws AiResponseException quando a resposta não é utilizável
     */
    public void validateCompleteness(JsonNode response) {
        JsonNode candidates = response.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new AiResponseException(AiResponseException.Kind.EMPTY_OUTPUT,
                    "Resposta da IA sem candidates");
        }

        JsonNode firstCandidate = candidates.path(0);
        String finishReason = firstCandidate.path("finishReason").asText(null);

        // finishReason nulo NÃO é falha por si só: alguns provedores omitem o campo.
        // A completude é então garantida pela verificação de output não-vazio abaixo.
        if (finishReason != null) {
            switch (finishReason) {
                case "STOP" -> {
                    // caminho feliz — segue para a verificação de output.
                }
                case "MAX_TOKENS" -> throw new AiResponseException(
                        AiResponseException.Kind.TRUNCATED, "Resposta truncada (MAX_TOKENS)");
                case "SAFETY", "RECITATION" -> throw new AiResponseException(
                        AiResponseException.Kind.BLOCKED_SAFETY,
                        "Resposta bloqueada por seguranca (" + finishReason + ")");
                default -> throw new AiResponseException(
                        AiResponseException.Kind.TRUNCATED,
                        "Resposta incompleta (finishReason=" + finishReason + ")");
            }
        }

        String output = extractOutputText(firstCandidate);
        if (output.isBlank()) {
            throw new AiResponseException(AiResponseException.Kind.EMPTY_OUTPUT,
                    "Resposta da IA vazia");
        }
    }

    /**
     * Concatena o {@code text} de cada parte em {@code content.parts} do candidato.
     *
     * <p>Replica a lógica de {@code AiTelemetryMapper.extractOutputText} para que a
     * verificação de completude seja independente do mapeamento de telemetria.
     *
     * @param candidate o primeiro candidato (ou um nó vazio)
     * @return o output concatenado (string vazia quando não há partes de texto)
     */
    private static String extractOutputText(JsonNode candidate) {
        JsonNode parts = candidate.path("content").path("parts");
        if (!parts.isArray()) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (JsonNode part : parts) {
            JsonNode text = part.path("text");
            if (text.isTextual()) {
                sb.append(text.asText());
            }
        }
        return sb.toString();
    }
}
