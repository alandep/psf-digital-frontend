package com.eip.modules.ai.application;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.eip.modules.ai.domain.error.AiResponseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

import lombok.RequiredArgsConstructor;

/**
 * Parses and validates the structured JSON {@code output} returned by the AI
 * gateway (Vertex) into a typed domain/view record before it is used downstream.
 *
 * <p>Thin application component analogous to {@link ExtractionResultValidator}:
 * it deserializes the raw JSON with the shared Jackson {@link ObjectMapper} and
 * then applies Bean Validation with the shared {@link Validator}. Any content
 * failure — malformed JSON, blank output, or a constraint violation (missing /
 * wrong-typed required field) — raises an {@link AiResponseException}, which the
 * {@code AiExceptionHandler} maps to HTTP 422 {@code AI_RESPONSE_INVALID}. The
 * invalid value is never returned.
 */
@Component
@RequiredArgsConstructor
public class StructuredOutputParser {

    private final ObjectMapper objectMapper;
    private final Validator validator;

    /**
     * Parses and validates the structured AI output into {@code type}.
     *
     * @param json the raw structured JSON output produced by the AI gateway
     * @param type the target record/DTO class to deserialize into
     * @param <T>  the target type
     * @return the parsed, validated instance
     * @throws AiResponseException when the output is empty, cannot be parsed, or
     *                             violates the target type's Bean Validation
     *                             constraints (mapped to {@code AI_RESPONSE_INVALID})
     */
    public <T> T parse(String json, Class<T> type) {
        if (json == null || json.isBlank()) {
            throw new AiResponseException(
                    AiResponseException.Kind.EMPTY_OUTPUT,
                    "Saida estruturada da IA vazia para " + type.getSimpleName());
        }

        T value;
        try {
            value = objectMapper.readValue(json, type);
        } catch (JsonProcessingException ex) {
            throw new AiResponseException(
                    AiResponseException.Kind.MALFORMED_JSON,
                    "Saida estruturada da IA invalida para " + type.getSimpleName()
                            + ": JSON nao pode ser interpretado (" + ex.getOriginalMessage() + ")",
                    ex);
        }

        Set<ConstraintViolation<T>> violations = validator.validate(value);
        if (!violations.isEmpty()) {
            String details = violations.stream()
                    .map(v -> v.getPropertyPath() + " " + v.getMessage())
                    .sorted()
                    .collect(Collectors.joining("; "));
            throw new AiResponseException(
                    AiResponseException.Kind.MISSING_FIELDS,
                    "Saida estruturada da IA invalida para " + type.getSimpleName()
                            + ": " + details);
        }

        return value;
    }
}
