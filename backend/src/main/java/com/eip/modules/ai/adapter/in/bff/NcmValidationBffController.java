package com.eip.modules.ai.adapter.in.bff;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase.AnalysisView;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase.AnalyzeCommand;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoint that validates an NCM code and derives export-compliance signals
 * (official description, export tax hint, licensing/inspection hints) using the
 * AI agent pipeline. This replaces the frontend mock "validar com a Receita".
 *
 * <p>No homologated government API (Receita Federal / Siscomex) is integrated
 * yet; when one becomes available it can back this same endpoint behind a
 * dedicated port without changing the front contract. The AI reasoning is a
 * best-effort assistant signal and does not constitute official fiscal advice.
 */
@RestController
@RequestMapping("/bff/ai/ncm")
@RequiredArgsConstructor
public class NcmValidationBffController {

    private final AnalyzeUseCase analyzeUseCase;

    @PostMapping("/validar")
    @PreAuthorize("@rbac.can('ai-operations/painel','create')")
    public NcmValidationResponse validar(@RequestBody NcmValidationRequest request) {
        String input = buildInput(request);
        AnalysisView result = analyzeUseCase.analyze(
                new AnalyzeCommand(AiTask.RISK_ANALYSIS.name(), input));
        // The agent returns prose guidance; we surface it as the official-style
        // description/notes. The code is echoed back and marked valid-format when
        // it matches the NCM mask (8 digits / 0000.00.00). Structured gov-grade
        // validation is deferred to a future government adapter.
        boolean formatoValido = request.ncmCode() != null
                && request.ncmCode().replaceAll("\\D", "").length() == 8;
        return new NcmValidationResponse(
                request.ncmCode(),
                formatoValido,
                result.output(),
                "AI_ASSIST");
    }

    private static String buildInput(NcmValidationRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Valide o enquadramento fiscal da NCM a seguir para exportação e explique, "
                + "de forma objetiva em pt-BR: descrição oficial provável, se há exigência de "
                + "licença/LPCO, se há necessidade de inspeção (ex.: MAPA) e eventuais restrições. "
                + "Deixe claro que é uma orientação assistida por IA, não oficial.\n");
        sb.append("NCM: ").append(request.ncmCode() == null ? "" : request.ncmCode().trim());
        if (request.productDescription() != null && !request.productDescription().isBlank()) {
            sb.append("\nDescrição do produto: ").append(request.productDescription().trim());
        }
        return sb.toString();
    }

    /** Request to validate an NCM code (optionally with product context). */
    public record NcmValidationRequest(@NotBlank String ncmCode, String productDescription) {
    }

    /** Validation result: format validity + AI-assisted regulatory notes. */
    public record NcmValidationResponse(String ncmCode, boolean formatValid, String notes, String source) {
    }
}
