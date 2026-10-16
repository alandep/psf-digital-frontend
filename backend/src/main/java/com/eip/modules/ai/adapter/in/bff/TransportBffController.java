package com.eip.modules.ai.adapter.in.bff;

import java.math.BigDecimal;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.ai.application.StructuredOutputParser;
import com.eip.modules.ai.domain.model.AiTask;
import com.eip.modules.ai.domain.model.TransportSimulation;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase.AnalysisView;
import com.eip.modules.ai.domain.port.in.AnalyzeUseCase.AnalyzeCommand;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoint for the structured transport simulation capability. Runs the
 * {@link AiTask#TRANSPORT_SIMULATION} analysis through the shared AI pipeline,
 * then parses/validates the structured JSON output into a typed
 * {@link TransportSimulation} so the front never has to {@code JSON.parse} a
 * string.
 *
 * <p>Malformed or incomplete AI output surfaces as HTTP 422
 * {@code AI_RESPONSE_INVALID} via {@link StructuredOutputParser} and the
 * module's {@code AiExceptionHandler}; quota exhaustion surfaces as HTTP 402.
 */
@RestController
@RequestMapping("/bff/ai/transporte")
@RequiredArgsConstructor
public class TransportBffController {

    private final AnalyzeUseCase analyzeUseCase;
    private final StructuredOutputParser parser;

    @PostMapping("/simular")
    @PreAuthorize("@rbac.can('ai-operations/painel','create')")
    public TransportSimulation simular(@Valid @RequestBody TransportSimRequest request) {
        String input = buildInput(request);
        AnalysisView result = analyzeUseCase.analyze(
                new AnalyzeCommand(AiTask.TRANSPORT_SIMULATION.name(), input));
        return parser.parse(result.output(), TransportSimulation.class);
    }

    /**
     * Assembles a legible, single input text from the request fields for the
     * transport simulation prompt, exposing origin/destination, product,
     * quantity, preferred modal, incoterm and desired date.
     */
    private static String buildInput(TransportSimRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Origem: ").append(request.origin().trim());
        sb.append('\n').append("Destino: ").append(request.destination().trim());
        sb.append('\n').append("Produto: ").append(request.product().trim());
        sb.append('\n').append("Quantidade (toneladas): ").append(request.quantityTons().toPlainString());
        sb.append('\n').append("Modal preferido: ").append(request.preferredModal().trim());
        sb.append('\n').append("Incoterm: ").append(request.incoterm().trim());
        sb.append('\n').append("Data desejada: ").append(request.desiredDate().trim());
        return sb.toString();
    }

    /**
     * Request to simulate a transport operation. All fields are required; the
     * {@code quantityTons} is expressed as a decimal number of tons and
     * {@code desiredDate} as an ISO date string.
     */
    public record TransportSimRequest(
            @NotBlank String origin,
            @NotBlank String destination,
            @NotBlank String product,
            @NotNull BigDecimal quantityTons,
            @NotBlank String preferredModal,
            @NotBlank String incoterm,
            @NotBlank String desiredDate) {
    }
}
