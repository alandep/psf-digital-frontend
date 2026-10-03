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
}
