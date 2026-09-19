package com.eip.modules.ai.adapter.out.persistence;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiPriority;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.port.out.ModelRouterPort;
import com.eip.platform.error.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Router adapter over the global {@code ai_model_config} catalog. Applies a
 * default-priority strategy per task, then falls back to any enabled row for
 * the task.
 */
@Component
@RequiredArgsConstructor
public class ModelRouterAdapter implements ModelRouterPort {

    private final AiModelConfigJpaRepository jpa;

    /** Default priority tier per task. */
    private static AiPriority defaultPriority(AiTask task) {
        return switch (task) {
            case NCM_CLASSIFICATION, DOCUMENT_SUMMARY, TRANSLATION -> AiPriority.FAST;
            case DOCUMENT_EXTRACTION, CHAT -> AiPriority.STANDARD;
            case RISK_ANALYSIS -> AiPriority.DEEP;
        };
    }

    @Override
    public AiModel resolve(AiTask task) {
        AiPriority priority = defaultPriority(task);
        AiModelConfigEntity entity = jpa
                .findByTaskAndPriority(task.name(), priority.name())
                .orElseGet(() -> jpa.findByTaskAndEnabledTrue(task.name()).stream()
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Nenhum modelo configurado para a tarefa " + task.name())));
        return toModel(entity);
    }

    @Override
    public List<AiModel> all() {
        return jpa.findByEnabledTrue().stream().map(ModelRouterAdapter::toModel).toList();
    }

    private static AiModel toModel(AiModelConfigEntity e) {
        return new AiModel(e.getProvider(), e.getModel(),
                AiTask.valueOf(e.getTask()), AiPriority.valueOf(e.getPriority()),
                e.getCostClass());
    }
}
