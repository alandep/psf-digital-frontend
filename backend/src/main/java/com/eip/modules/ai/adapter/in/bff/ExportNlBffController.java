package com.eip.modules.ai.adapter.in.bff;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.ai.application.StructuredOutputParser;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.model.ExportDraft;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase.AnalysisView;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase.AnalyzeCommand;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoint for the natural-language export creation capability. Runs the
 * {@link AiTask#EXPORT_NL_CREATION} analysis through the shared AI pipeline,
 * then parses/validates the structured JSON output into a typed
 * {@link ExportDraft} so the front never has to {@code JSON.parse} a string.
 *
 * <p><strong>Humano no circuito:</strong> este endpoint apenas PROPÕE um
 * rascunho de exportação a partir do comando em linguagem natural. Ele
 * <em>não</em> cria, persiste nem efetiva nenhuma exportação. A criação real
 * só pode ocorrer após revisão e confirmação explícita de um humano no
 * frontend; a resposta aqui é estritamente um {@link ExportDraft} para
 * pré-preenchimento e revisão.
 *
 * <p>Malformed or incomplete AI output surfaces as HTTP 422
 * {@code AI_RESPONSE_INVALID} via {@link StructuredOutputParser} and the
 * module's {@code AiExceptionHandler}; quota exhaustion surfaces as HTTP 402.
 */
@RestController
@RequestMapping("/bff/ai/exportacao")
@RequiredArgsConstructor
public class ExportNlBffController {

    private final AnalyzeUseCase analyzeUseCase;
    private final StructuredOutputParser parser;

    /**
     * Propõe um rascunho de exportação a partir de um comando em linguagem
     * natural. NÃO cria a exportação; apenas devolve o {@link ExportDraft}
     * tipado para revisão humana.
     */
    @PostMapping("/criar-nl")
    @PreAuthorize("@rbac.can('ai-operations/painel','create')")
    public ExportDraft criarPorLinguagemNatural(@Valid @RequestBody NlCreateRequest request) {
        AnalysisView result = analyzeUseCase.analyze(
                new AnalyzeCommand(AiTask.EXPORT_NL_CREATION.name(), request.command()));
        return parser.parse(result.output(), ExportDraft.class);
    }

    /**
     * Request carrying the free-text natural-language command describing the
     * intended export. The {@code command} is required.
     */
    public record NlCreateRequest(
            @NotBlank String command) {
    }
}
