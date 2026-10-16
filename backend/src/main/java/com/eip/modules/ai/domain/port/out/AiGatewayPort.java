package com.eip.modules.ai.domain.port.out;

import com.eip.modules.ai.domain.model.AiExecutionPolicy;
import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiPromptSpec;
import com.eip.modules.ai.domain.model.AiRequest;
import com.eip.modules.ai.domain.model.AiResult;

/**
 * Outbound port to the AI provider. Implemented by a provider adapter (mock in
 * DEV, a real Vertex AI adapter in the cloud profile). The {@link AiModel}
 * carries the provider/model the router selected.
 *
 * <p>The port exposes two shapes: a legacy {@code run(AiModel, AiRequest)}
 * default method kept for backward compatibility, and the richer
 * {@code run(AiModel, AiRequest, AiExecutionPolicy, AiPromptSpec)} overload that
 * carries the execution policy and the fully built prompt resolved in the
 * application layer. The adapter honours policy and prompt without knowing any
 * business concerns.
 */
public interface AiGatewayPort {

    /**
     * Legacy signature kept for backward compatibility (the mock and current
     * call sites). Delegates to the policy/prompt overload using a conservative
     * default policy and a passthrough prompt derived from the request.
     *
     * @param model   the resolved model route to call
     * @param request the originating AI request
     * @return the AI result with telemetry
     */
    default AiResult run(AiModel model, AiRequest request) {
        return run(model, request, AiExecutionPolicy.defaults(model), AiPromptSpec.passthrough(request));
    }

    /**
     * Runs the AI call with an explicit execution policy and a fully built
     * prompt. Both are resolved in the application layer (never in controllers
     * or in the adapter), so the adapter can honour them without knowing
     * business concerns.
     *
     * @param model   the resolved model route to call
     * @param request the originating AI request
     * @param policy  the execution policy (model, thinking level, limits)
     * @param prompt  the fully built prompt specification
     * @return the AI result with telemetry
     */
    AiResult run(AiModel model, AiRequest request, AiExecutionPolicy policy, AiPromptSpec prompt);

    /**
     * Runs a multimodal (binary OCR) AI call from a file reference stored in the
     * object storage. The provider reads the binary itself from the given
     * {@link StorageRef} (e.g. {@code gs://bucket/key}) — the application layer
     * never downloads the bytes nor forwards them inline. In the cloud profile
     * this is served by Gemini multimodal via Vertex AI, which fetches the file
     * from the storage URI and honours the policy and the structured prompt.
     *
     * <p>Executa a chamada multimodal (OCR de binário) a partir de uma referência
     * de arquivo no object storage. O provedor lê o binário diretamente da
     * {@link StorageRef} informada (ex.: {@code gs://bucket/key}); a camada de
     * aplicação nunca baixa os bytes nem os envia inline. No profile {@code cloud}
     * é atendida pelo Gemini multimodal via Vertex, honrando a política e o prompt
     * estruturado como no overload {@code run}.
     *
     * @param model      the resolved model route to call (a multimodal-capable model)
     * @param request    the originating AI request
     * @param policy     the execution policy (model, thinking level, limits)
     * @param prompt     the fully built prompt specification (carries the response schema)
     * @param storageRef the reference to the binary file in the object storage
     * @return the AI result with telemetry (e.g. {@code ocrPages > 0})
     */
    AiResult runMultimodal(AiModel model, AiRequest request, AiExecutionPolicy policy,
                           AiPromptSpec prompt, StorageRef storageRef);

    /**
     * Reference to a binary object in the object storage, read by the provider
     * during a multimodal call.
     *
     * <p>Referência a um objeto binário no object storage, lido pelo provedor
     * durante uma chamada multimodal.
     *
     * @param uri       the storage object reference (e.g. {@code gs://bucket/key})
     * @param mediaType the binary MIME type (e.g. {@code application/pdf})
     */
    record StorageRef(String uri, String mediaType) {}
}
