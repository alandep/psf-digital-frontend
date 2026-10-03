package com.eip.modules.ai.adapter.out.persistence;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eip.modules.ai.domain.model.AiModel;
import com.eip.modules.ai.domain.model.AiPriority;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.model.AiThinkingLevel;
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
        return toModel(findEntity(task));
    }

    @Override
    public AiModelRoute resolveRoute(AiTask task) {
        AiModelConfigEntity entity = findEntity(task);
        return new AiModelRoute(toModel(entity),
                parseThinkingLevel(entity.getThinkingLevel()),
                entity.getMaxOutputTokens(),
                entity.isThinkingSupported(),
                entity.getThinkingBudgetTokens());
    }

    @Override
    public List<AiModel> all() {
        return jpa.findByEnabledTrue().stream().map(ModelRouterAdapter::toModel).toList();
    }

    /**
     * Shared entity-finding strategy: the default-priority row for the task,
     * falling back to any enabled row for the task.
     *
     * @param task the task to resolve
     * @return the matching config entity (never {@code null})
     * @throws ResourceNotFoundException when no enabled row exists for the task
     */
    private AiModelConfigEntity findEntity(AiTask task) {
        AiPriority priority = defaultPriority(task);
        return jpa
                .findByTaskAndPriority(task.name(), priority.name())
                .orElseGet(() -> jpa.findByTaskAndEnabledTrue(task.name()).stream()
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Nenhum modelo configurado para a tarefa " + task.name())));
    }

    /**
     * Parses the optional {@code thinking_level} column into an
     * {@link AiThinkingLevel}. Blank/null yields {@code null} so the application
     * layer falls back to its priority-derived default.
     *
     * @param raw the raw column value (may be {@code null}/blank)
     * @return the parsed level, or {@code null} when unset
     */
    private static AiThinkingLevel parseThinkingLevel(String raw) {
        return (raw != null && !raw.isBlank())
                ? AiThinkingLevel.valueOf(raw.trim())
                : null;
    }

    private static AiModel toModel(AiModelConfigEntity e) {
        return new AiModel(e.getProvider(), e.getModel(),
                AiTask.valueOf(e.getTask()), AiPriority.valueOf(e.getPriority()),
                e.getCostClass());
    }
}
