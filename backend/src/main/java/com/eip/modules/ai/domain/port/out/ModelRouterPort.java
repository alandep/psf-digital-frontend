package com.eip.modules.ai.domain.port.out;

import java.util.List;

import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiTask;

/**
 * Outbound port that resolves which model serves a given task, reading the
 * global {@code ai_model_config} catalog.
 */
public interface ModelRouterPort {

    /** Resolves the model to use for {@code task} by the default priority strategy. */
    AiModel resolve(AiTask task);

    /** Lists all enabled router entries. */
    List<AiModel> all();
}
