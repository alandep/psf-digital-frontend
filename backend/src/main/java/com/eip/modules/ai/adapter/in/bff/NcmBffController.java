package com.eip.modules.ai.adapter.in.bff;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.ai.application.StructuredOutputParser;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.model.NcmClassification;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase.AnalysisView;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase.AnalyzeCommand;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoint for the structured NCM classification capability. Runs the
 * {@link AiTask#NCM_CLASSIFICATION} analysis through the shared AI pipeline,
 * then parses/validates the structured JSON output into a typed
 * {@link NcmClassification} so the front never has to {@code JSON.parse} a
 * string.
 *
 * <p>Malformed or incomplete AI output surfaces as HTTP 422
 * {@code AI_RESPONSE_INVALID} via {@link StructuredOutputParser} and the
 * module's {@code AiExceptionHandler}; quota exhaustion surfaces as HTTP 402.
 */
@RestController
@RequestMapping("/bff/ai/ncm")
@RequiredArgsConstructor
public class NcmBffController {

    private final AnalyzeUseCase analyzeUseCase;
    private final StructuredOutputParser parser;

    @PostMapping("/classificar")
    @PreAuthorize("@rbac.can('ai-operations/painel','create')")
    public NcmClassification classificar(@Valid @RequestBody NcmClassifyRequest request) {
        String input = buildInput(request);
        AnalysisView result = analyzeUseCase.analyze(
                new AnalyzeCommand(AiTask.NCM_CLASSIFICATION.name(), input));
        return parser.parse(result.output(), NcmClassification.class);
    }

    /**
     * Assembles a legible, single input text from the request fields for the
     * classification prompt. Only the description is mandatory; the remaining
     * fields are appended when present to give the model more signal.
     */
    private static String buildInput(NcmClassifyRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Descrição: ").append(request.description().trim());
        appendIfPresent(sb, "Nome do produto", request.productName());
        appendIfPresent(sb, "Nome científico", request.scientificName());
        appendIfPresent(sb, "Tipo de commodity", request.commodityType());
        return sb.toString();
    }

    private static void appendIfPresent(StringBuilder sb, String label, String value) {
        if (value != null && !value.isBlank()) {
            sb.append('\n').append(label).append(": ").append(value.trim());
        }
    }

    /**
     * Request to classify a product into an NCM code. The {@code description}
     * is required; the other fields are optional refinements.
     */
    public record NcmClassifyRequest(
            @NotBlank String description,
            String productName,
            String scientificName,
            String commodityType) {
    }
}
