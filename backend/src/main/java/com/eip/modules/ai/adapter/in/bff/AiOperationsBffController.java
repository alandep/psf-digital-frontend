package com.eip.modules.ai.adapter.in.bff;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.ai.domain.port.in.AiOperationsQueryUseCase;
import com.eip.modules.ai.domain.port.in.AiOperationsQueryUseCase.AiErrorView;
import com.eip.modules.ai.domain.port.in.AiOperationsQueryUseCase.CapabilityMetricView;
import com.eip.modules.ai.domain.port.in.AiOperationsQueryUseCase.MetricsWindow;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the AI Operations Center dashboard (Req 13). Expose
 * capability-level metrics and the latest errors derived from the tenant-scoped
 * usage ledger. Read-only; guarded by the {@code ai-operations/painel} view
 * permission.
 */
@RestController
@RequestMapping("/bff/ai/operations")
@RequiredArgsConstructor
public class AiOperationsBffController {

    private final AiOperationsQueryUseCase operationsQueryUseCase;

    @GetMapping("/metrics")
    @PreAuthorize("@rbac.can('ai-operations/painel','view')")
    public List<CapabilityMetricView> metrics() {
        return operationsQueryUseCase.capabilityMetrics(MetricsWindow.LAST_24H);
    }

    @GetMapping("/errors")
    @PreAuthorize("@rbac.can('ai-operations/painel','view')")
    public List<AiErrorView> errors() {
        return operationsQueryUseCase.recentErrors(50);
    }
}
