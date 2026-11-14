package com.eip.modules.finance.adapter.in.bff;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.finance.domain.model.RentabilidadeAnalise;
import com.eip.modules.finance.domain.port.in.GerenciarRentabilidadeUseCase;
import com.eip.modules.finance.domain.port.in.GerenciarRentabilidadeUseCase.CriarAnaliseCommand;
import com.eip.platform.error.BusinessRuleException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints for saved profitability analyses.
 */
@RestController
@RequestMapping("/bff/rentabilidade/analises")
@RequiredArgsConstructor
public class RentabilidadeBffController {

    private final GerenciarRentabilidadeUseCase useCase;
    private final ObjectMapper objectMapper;

    /** Request body; {@code payload} is the free-form analysis JSON object. */
    public record AnaliseRequest(
            String exportacaoRef,
            String produto,
            Integer score,
            BigDecimal margem,
            BigDecimal lucroBrl,
            JsonNode payload) {
    }

    /** Response body. */
    public record AnaliseView(
            UUID id,
            String exportacaoRef,
            String produto,
            Integer score,
            BigDecimal margem,
            BigDecimal lucroBrl,
            JsonNode payload,
            OffsetDateTime createdAt) {
    }

    @GetMapping
    @PreAuthorize("@rbac.can('rentabilidade/analise','view')")
    public List<AnaliseView> listar() {
        return useCase.listar().stream().map(this::toView).toList();
    }

    @PostMapping
    @PreAuthorize("@rbac.can('rentabilidade/analise','create')")
    public AnaliseView criar(@RequestBody AnaliseRequest request) {
        if (request.payload() == null || !request.payload().isObject()) {
            throw new BusinessRuleException("O conteúdo da análise deve ser um objeto JSON.");
        }
        String json;
        try {
            json = objectMapper.writeValueAsString(request.payload());
        } catch (JsonProcessingException ex) {
            throw new BusinessRuleException("Conteúdo da análise inválido.");
        }
        return toView(useCase.criar(new CriarAnaliseCommand(
                request.exportacaoRef(), request.produto(), request.score(),
                request.margem(), request.lucroBrl(), json)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@rbac.can('rentabilidade/analise','delete')")
    public void excluir(@PathVariable UUID id) {
        useCase.excluir(id);
    }

    private AnaliseView toView(RentabilidadeAnalise a) {
        JsonNode payload;
        try {
            payload = objectMapper.readTree(a.payloadJson());
        } catch (JsonProcessingException ex) {
            payload = objectMapper.createObjectNode();
        }
        return new AnaliseView(a.id(), a.exportacaoRef(), a.produto(), a.score(), a.margem(),
                a.lucroBrl(), payload, a.createdAt());
    }
}
