package com.eip.modules.compliance.application;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Small internal helpers shared by the compliance application services: safe
 * enum parsing from request strings and minimal JSON payload construction for
 * the transactional outbox.
 */
final class ComplianceEnums {

    private ComplianceEnums() {
    }

    /**
     * Parses {@code value} into the given enum type.
     *
     * @throws BusinessRuleException if the value is missing or not a valid constant
     */
    static <E extends Enum<E>> E parse(Class<E> type, String value, String field) {
        if (value == null || value.isBlank()) {
            throw new BusinessRuleException("Campo obrigatorio: " + field);
        }
        try {
            return Enum.valueOf(type, value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException("Valor invalido para " + field + ": " + value);
        }
    }

    /** Parses {@code value} into the given enum type, returning {@code null} when blank. */
    static <E extends Enum<E>> E parseOrNull(Class<E> type, String value, String field) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return parse(type, value, field);
    }

    /** Builds a minimal JSON event payload. */
    static String payload(String idField, UUID id, UUID org) {
        return "{\"" + idField + "\":\"" + id + "\",\"organizationId\":\"" + org
                + "\",\"occurredAt\":\"" + OffsetDateTime.now() + "\"}";
    }
}
