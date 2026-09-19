package com.eip.modules.export.domain.model;

import java.util.UUID;

/**
 * Strongly-typed identifier of an {@link Exportacao} aggregate.
 */
public record ExportacaoId(UUID value) {

    public ExportacaoId {
        if (value == null) {
            throw new IllegalArgumentException("ExportacaoId value must not be null");
        }
    }

    public static ExportacaoId of(UUID value) {
        return new ExportacaoId(value);
    }

    public static ExportacaoId of(String value) {
        return new ExportacaoId(UUID.fromString(value));
    }

    public static ExportacaoId novo() {
        return new ExportacaoId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
