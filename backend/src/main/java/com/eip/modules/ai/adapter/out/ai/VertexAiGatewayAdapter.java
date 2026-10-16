package com.eip.modules.ai.adapter.out.ai;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.eip.modules.ai.domain.model.AiExecutionPolicy;
import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiPromptSpec;
import com.eip.modules.ai.domain.model.AiRequest;
import com.eip.modules.ai.domain.model.AiResult;
import com.eip.modules.ai.domain.port.out.AiGatewayPort;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

/**
 * Real provider implementation of {@link AiGatewayPort} that calls the Vertex AI
 * Gemini {@code generateContent} REST endpoint, active only in the {@code cloud}
 * profile.
 *
 * <p><strong>Demo safety:</strong> this bean is annotated {@code @Profile("cloud")}
 * so it <em>replaces</em> {@code MockAiGatewayAdapter} ({@code @Profile("!cloud")})
 * only when the {@code cloud} profile is active. The default / local demo profile
 * keeps using the deterministic mock.
 *
 * <p><strong>Scope:</strong> this adapter does transport only (request assembly,
 * token lookup via {@link VertexAiCredentialsProvider} and response mapping).
 * It knows <em>nothing</em> about NCM, invoices, pedidos or any business
 * concern — those live in the prompt registry, and the fully built
 * {@link AiPromptSpec} is handed to it. Response parsing is delegated to
 * {@link AiTelemetryMapper}.
 *
 * <p><strong>Authentication:</strong> bearer tokens are supplied by the
 * {@link VertexAiCredentialsProvider} (ADC only, no {@code key.json}). That
 * provider is {@code @Profile("cloud")} and performs fail-fast ADC resolution at
 * startup, so a missing-credentials environment prevents the context from booting
 * rather than failing on the first call. The token value is <strong>never</strong>
 * logged here or in the provider.
 *
 * <p><strong>Resilience:</strong> the single provider HTTP call is delegated to
 * the separate {@link VertexAiCaller} bean, which carries the Resilience4j
 * annotations ({@code @Retry}/{@code @CircuitBreaker}/{@code @Bulkhead}) and the
 * HTTP-client-level timeout. Delegating to a distinct bean (rather than calling an
 * annotated method on {@code this}) ensures the call passes through the Spring AOP
 * proxy, so the resilience annotations actually take effect. This adapter keeps
 * request assembly, token lookup and response mapping only.
 */
@Slf4j
@Component
@Profile("cloud")
public class VertexAiGatewayAdapter implements AiGatewayPort {

    private final VertexAiProperties props;
    private final VertexAiCaller caller;
    private final VertexAiCredentialsProvider credentials;
    private final AiTelemetryMapper telemetry;
    private final ObjectMapper objectMapper;
    private final AiProviderExceptionTranslator exceptionTranslator;
    private final AiResponseValidator responseValidator;

    /**
     * @param props               the environment-driven Vertex configuration
     *                            (project/location/endpoint/apiVersion)
     * @param caller              the resilient, Resilience4j-annotated bean that
     *                            performs the single provider HTTP call (via the
     *                            AOP proxy)
     * @param credentials         supplies ADC bearer tokens and performs startup
     *                            fail-fast when ADC is unavailable
     * @param telemetry           maps the provider response into {@link AiResult}
     * @param objectMapper        the Jackson mapper used to build/parse JSON bodies
     * @param exceptionTranslator translates raw transport exceptions from the
     *                            caller into the AI error domain taxonomy
     * @param responseValidator   verifica a completude da resposta (candidates,
     *                            finishReason, output) antes do mapeamento de
     *                            telemetria, lançando {@code AiResponseException}
     *                            (→ 422) quando a resposta é inutilizável
     */
    public VertexAiGatewayAdapter(VertexAiProperties props,
                                  VertexAiCaller caller,
                                  VertexAiCredentialsProvider credentials,
                                  AiTelemetryMapper telemetry,
                                  ObjectMapper objectMapper,
                                  AiProviderExceptionTranslator exceptionTranslator,
                                  AiResponseValidator responseValidator) {
        this.props = props;
        this.caller = caller;
        this.credentials = credentials;
        this.telemetry = telemetry;
        this.objectMapper = objectMapper;
        this.exceptionTranslator = exceptionTranslator;
        this.responseValidator = responseValidator;
    }

    @Override
    public AiResult run(AiModel model, AiRequest request, AiExecutionPolicy policy, AiPromptSpec prompt) {
        // contents: a single user turn carrying the prompt text only.
        Map<String, Object> userPart = Map.of("text", prompt.userPrompt());
        Map<String, Object> userTurn = Map.of("role", "user", "parts", List.of(userPart));
        Map<String, Object> body = buildRequestBody(policy, prompt, List.of(userTurn));

        return execute(model, body);
    }

    /**
     * Executa a chamada multimodal (OCR de binário) do Gemini via Vertex AI. É a
     * contraparte multimodal do {@link #run}: usa exatamente a mesma montagem de
     * corpo, URL, token ADC, resiliência, validação de completude e mapeamento de
     * telemetria, diferindo apenas no turno do usuário, que carrega DUAS parts —
     * uma {@code fileData} apontando para o binário no object storage pela
     * {@code fileUri} ({@code gs://bucket/key}) e uma {@code text} com o prompt.
     *
     * <p>O provedor (Gemini multimodal) lê o binário diretamente pela
     * {@code fileUri} informada no {@link StorageRef}; este adapter nunca baixa os
     * bytes nem os envia inline, e <strong>não</strong> habilita nenhuma nova API
     * GCP — tudo passa pelo mesmo endpoint {@code generateContent} já usado pelo
     * {@link #run}. O {@code responseSchema} do {@link AiPromptSpec} é aplicado da
     * mesma forma, garantindo saída estruturada da extração.
     */
    @Override
    public AiResult runMultimodal(AiModel model, AiRequest request, AiExecutionPolicy policy,
                                  AiPromptSpec prompt, StorageRef storageRef) {
        // contents: a single user turn carrying the file reference (fileData) read
        // by the provider from the storage URI, followed by the prompt text. The
        // binary is NEVER downloaded here nor sent inline — only its gs:// URI.
        Map<String, Object> fileDataPart = Map.of("fileData",
                Map.of("fileUri", storageRef.uri(), "mimeType", storageRef.mediaType()));
        Map<String, Object> textPart = Map.of("text", prompt.userPrompt());
        Map<String, Object> userTurn = Map.of("role", "user", "parts", List.of(fileDataPart, textPart));
        Map<String, Object> body = buildRequestBody(policy, prompt, List.of(userTurn));

        return execute(model, body);
    }

    /**
     * Shared transport pipeline for both {@link #run} and {@link #runMultimodal}:
     * resolves the URL and ADC bearer token, performs the single resilient
     * provider call (translating transport failures into the AI error taxonomy),
     * measures latency, validates response completeness and maps telemetry.
     *
     * @param model the resolved model route to call
     * @param body  the fully assembled {@code generateContent} request body
     * @return the AI result with telemetry
     */
    private AiResult execute(AiModel model, Map<String, Object> body) {
        String url = buildUrl(model.model());
        String bearerToken = credentials.bearerToken();

        long start = System.nanoTime();
        JsonNode response;
        try {
            response = caller.call(url, bearerToken, body);
        } catch (RuntimeException raw) {
            // Traduz falhas de transporte/disponibilidade do caller (Resilience4j /
            // RestClient) para a taxonomia de erro de domínio. Falhas funcionais
            // (4xx não-429) e exceções desconhecidas são relançadas inalteradas.
            throw exceptionTranslator.translate(raw);
        }
        long latencyMs = (System.nanoTime() - start) / 1_000_000;

        // Verifica a completude da resposta ANTES do mapeamento de telemetria e do
        // parse de negócio. Uma AiResponseException propaga até o AiExceptionHandler
        // (→ 422 AI_RESPONSE_INVALID); nada é persistido para uma resposta inválida.
        responseValidator.validateCompleteness(response);

        return telemetry.toResult(model, response, latencyMs);
    }

    /**
     * Builds the {@code generateContent} URL from configuration + the resolved
     * model id:
     * {@code {endpoint}/{apiVersion}/projects/{project}/locations/{location}/publishers/google/models/{model}:generateContent}.
     *
     * @param modelId the provider model id resolved by the router
     * @return the request URL
     */
    private String buildUrl(String modelId) {
        return "%s/%s/projects/%s/locations/%s/publishers/google/models/%s:generateContent".formatted(
                props.endpoint(), props.apiVersion(), props.project(), props.location(), modelId);
    }

    /**
     * Assembles the Gemini {@code generateContent} request body from the prompt
     * and execution policy, wiring in the already-built {@code contents} turns.
     * The adapter never injects business content — it only wires the already-built
     * {@link AiPromptSpec} into the provider shape. The {@code contents} are built
     * by the caller: {@link #run} passes a single text turn, while
     * {@link #runMultimodal} passes a turn carrying a {@code fileData} part plus
     * the prompt text. Everything else (systemInstruction + generationConfig) is
     * identical for both flows.
     *
     * @param policy   the execution policy (max output tokens, thinking support +
     *                 budget)
     * @param prompt   the fully built prompt spec
     * @param contents the already-assembled {@code contents} turns to send
     * @return the JSON request body as a map
     */
    private Map<String, Object> buildRequestBody(AiExecutionPolicy policy, AiPromptSpec prompt,
                                                 List<Map<String, Object>> contents) {
        Map<String, Object> body = new LinkedHashMap<>();

        // contents: the user turn(s) assembled by the caller (text-only for run,
        // fileData + text for runMultimodal).
        body.put("contents", contents);

        // systemInstruction: only when provided.
        if (prompt.systemInstruction() != null) {
            body.put("systemInstruction",
                    Map.of("parts", List.of(Map.of("text", prompt.systemInstruction()))));
        }

        // generationConfig: output cap, optional nested thinkingConfig, plus
        // optional structured-output schema. thinkingConfig MUST be nested here
        // (not at the top level) and uses an INTEGER thinkingBudget (token count)
        // supplied by the policy; it is omitted entirely for models without
        // thinking support.
        Map<String, Object> generationConfig = new LinkedHashMap<>();
        generationConfig.put("maxOutputTokens", policy.maxOutputTokens());
        // thinkingConfig is sent ONLY when the model supports thinking. The budget
        // (token count) is a resolved config value carried by the policy — the
        // adapter translates policy -> provider contract and knows no budget numbers.
        if (policy.thinkingSupported()) {
            generationConfig.put("thinkingConfig",
                    Map.of("thinkingBudget", policy.thinkingBudgetTokens()));
        }
        if (prompt.responseSchemaJson() != null) {
            generationConfig.put("responseMimeType", "application/json");
            generationConfig.put("responseSchema", parseSchema(prompt.responseSchemaJson()));
        }
        body.put("generationConfig", generationConfig);

        return body;
    }

    /**
     * Parses the response JSON schema string into a Jackson node for embedding in
     * {@code generationConfig.responseSchema}.
     *
     * @param schemaJson the response schema JSON (never {@code null} here)
     * @return the parsed schema node
     * @throws IllegalStateException when the schema is not valid JSON
     */
    private JsonNode parseSchema(String schemaJson) {
        try {
            return objectMapper.readTree(schemaJson);
        } catch (IOException e) {
            throw new IllegalStateException("Invalid response schema JSON for Vertex request", e);
        }
    }
}
