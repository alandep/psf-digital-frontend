package com.eip.modules.ai.domain.port.out;

import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiRequest;
import com.eip.modules.ai.domain.model.AiResult;

/**
 * Outbound port to the AI provider. Implemented by a provider adapter (mock in
 * DEV, a real Vertex AI adapter in the cloud profile). The {@link AiModel}
 * carries the provider/model the router selected.
 */
public interface AiGatewayPort {

    AiResult run(AiModel model, AiRequest request);
}
