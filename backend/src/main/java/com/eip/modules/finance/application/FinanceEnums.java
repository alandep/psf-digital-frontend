package com.eip.modules.finance.application;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Small internal helpers shared by the finance application services: safe enum
 * parsing from request strings and minimal JSON payload construction for the
 * transactional outbox.
 */
final class FinanceEnums {

    private FinanceEnums() {
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

    /** Builds a minimal JSON event payload. */
    static String payload(String idField, UUID id, UUID org) {
        return "{\"" + idField + "\":\"" + id + "\",\"organizationId\":\"" + org
                + "\",\"occurredAt\":\"" + OffsetDateTime.now() + "\"}";
    }
}
