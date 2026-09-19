package com.eip.modules.crm.domain.model;

import java.util.UUID;

/** Strongly-typed identifier of an {@link Oportunidade} aggregate. */
public record OportunidadeId(UUID value) {

    public OportunidadeId {
        if (value == null) {
            throw new IllegalArgumentException("OportunidadeId value must not be null");
        }
    }

    public static OportunidadeId of(UUID value) {
        return new OportunidadeId(value);
    }

    public static OportunidadeId of(String value) {
        return new OportunidadeId(UUID.fromString(value));
    }

    public static OportunidadeId novo() {
        return new OportunidadeId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
