package com.eip.modules.cms.application;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Small internal helpers shared by the CMS application services: safe enum
 * parsing, optional date parsing and minimal JSON payload construction for the
 * transactional outbox.
 */
final class CmsSupport {

    private CmsSupport() {
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

    /** Parses an ISO date, returning {@code null} when blank. */
    static LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (RuntimeException ex) {
            throw new BusinessRuleException("Data invalida: " + value);
        }
    }

    /** Builds a minimal JSON event payload. */
    static String payload(String idField, UUID id, UUID org) {
        return "{\"" + idField + "\":\"" + id + "\",\"organizationId\":\"" + org
                + "\",\"occurredAt\":\"" + OffsetDateTime.now() + "\"}";
    }
}
