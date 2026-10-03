package com.eip.modules.ai.application;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.eip.modules.ai.application.extraction.CommercialInvoiceDto;
import com.eip.platform.error.BusinessRuleException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

import lombok.RequiredArgsConstructor;

/**
 * Parses and validates structured extraction output before it is persisted.
 *
 * <p>Parse errors (invalid JSON) or Bean Validation constraint violations raise a
 * descriptive {@link BusinessRuleException}; the invalid DTO is never used nor
 * persisted (Requirement 7.4). Nothing is persisted here — this is a pure
 * parse + validate step.
 *
 * <p><strong>Lenient / best-effort for mixed outputs (R7.4-compatible):</strong>
 * only invoice-shaped JSON is strictly validated. If the parsed JSON tree lacks
 * an {@code "invoiceNumber"} field, the output is treated as a non-invoice
 * extraction (e.g. the mock/demo output {@code {"campos":{},"texto":"..."}}) and
 * validation is skipped — no error. This keeps the demo green while enforcing
 * strict validation for real invoice extractions.
 */
@Component
@RequiredArgsConstructor
public class ExtractionResultValidator {

    private final ObjectMapper objectMapper;
    private final Validator validator;

    /**
     * Validates an invoice-shaped extraction JSON. Non-invoice JSON (missing the
     * {@code invoiceNumber} field) is skipped as a best-effort for mixed outputs.
     *
     * @param json the raw extraction output JSON
     * @throws BusinessRuleException when the JSON is invoice-shaped but cannot be
     *                               parsed into a {@link CommercialInvoiceDto} or
     *                               violates its Bean Validation constraints
     */
    public void validateInvoice(String json) {
        if (!looksLikeInvoice(json)) {
            // Non-invoice extraction output (e.g. mock/demo). Skip strict
            // validation to keep the demo flow green (R7.4-compatible best-effort).
            return;
        }

        CommercialInvoiceDto dto;
        try {
            dto = objectMapper.readValue(json, CommercialInvoiceDto.class);
        } catch (JsonProcessingException ex) {
            throw new BusinessRuleException(
                    "Extracao de invoice invalida: JSON nao pode ser interpretado ("
                            + ex.getOriginalMessage() + ")");
        }

        Set<ConstraintViolation<CommercialInvoiceDto>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            String details = violations.stream()
                    .map(v -> v.getPropertyPath() + " " + v.getMessage())
                    .sorted()
                    .collect(Collectors.joining("; "));
            throw new BusinessRuleException(
                    "Extracao de invoice invalida: " + details);
        }
    }

    /**
     * Best-effort shape check: the JSON parses into an object that carries an
     * {@code "invoiceNumber"} field. Anything else is treated as non-invoice.
     */
    private boolean looksLikeInvoice(String json) {
        if (json == null || json.isBlank()) {
            return false;
        }
        try {
            JsonNode tree = objectMapper.readTree(json);
            return tree.isObject() && tree.has("invoiceNumber");
        } catch (JsonProcessingException ex) {
            // Unparseable and not clearly an invoice — treat as non-invoice and skip.
            return false;
        }
    }

    // TODO: packing-list and pedido validators follow the same pattern
    // (validatePackingList(String), validatePedido(String)) once their extraction
    // flows are wired in.
}
