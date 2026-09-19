package com.eip.modules.ai.adapter.in.bff;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.ai.domain.port.in.AnalyzeUseCase;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase.AnalysisView;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase.AnalyzeCommand;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase.JobView;
import com.eip.modules.ai.domain.port.in.UsageQueryUseCase;
import com.eip.modules.ai.domain.port.in.UsageQueryUseCase.ModelRouteView;
import com.eip.modules.ai.domain.port.in.UsageQueryUseCase.UsageView;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the front's AI operations panel and the document
 * analysis flow. Quota exhaustion surfaces as HTTP 402 via the module's
 * {@link com.eip.modules.ai.application.AiExceptionHandler}.
 */
@RestController
@RequestMapping("/bff/ai")
@RequiredArgsConstructor
public class AiHubBffController {

    private final AnalyzeUseCase analyzeUseCase;
    private final UsageQueryUseCase usageQueryUseCase;

    @PostMapping("/analisar")
    @PreAuthorize("@rbac.can('ai-operations/painel','create')")
    public AnalysisView analisar(@RequestBody AnalyzeRequest request) {
        return analyzeUseCase.analyze(new AnalyzeCommand(request.task(), request.input()));
    }

    @PostMapping("/analisar/async")
    @PreAuthorize("@rbac.can('ai-operations/painel','create')")
    public ResponseEntity<JobView> analisarAsync(@RequestBody AnalyzeRequest request) {
        JobView job = analyzeUseCase.analyzeAsync(new AnalyzeCommand(request.task(), request.input()));
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(job);
    }

    @GetMapping("/jobs/{id}")
    @PreAuthorize("@rbac.can('ai-operations/painel','view')")
    public JobView jobStatus(@PathVariable UUID id) {
        return analyzeUseCase.jobStatus(id);
    }

    @GetMapping("/uso")
    @PreAuthorize("@rbac.can('ai-operations/painel','view')")
    public List<UsageView> uso() {
        return usageQueryUseCase.currentUsage();
    }

    @GetMapping("/router")
    @PreAuthorize("@rbac.can('ai-operations/router','view')")
    public List<ModelRouteView> router() {
        return usageQueryUseCase.routerConfig();
    }

    /** Request to analyze an input for a given task. */
    public record AnalyzeRequest(@NotBlank String task, String input) {
    }
}
