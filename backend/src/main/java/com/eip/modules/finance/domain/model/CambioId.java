package com.eip.modules.finance.domain.model;

import java.util.UUID;

/** Strongly-typed identifier of a {@link CambioContrato} aggregate. */
public record CambioId(UUID value) {

    public CambioId {
        if (value == null) {
            throw new IllegalArgumentException("CambioId value must not be null");
        }
    }

    public static CambioId of(UUID value) {
        return new CambioId(value);
    }

    public static CambioId of(String value) {
        return new CambioId(UUID.fromString(value));
    }

    public static CambioId novo() {
        return new CambioId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
