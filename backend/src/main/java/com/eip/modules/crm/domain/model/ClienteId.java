package com.eip.modules.crm.domain.model;

import java.util.UUID;

/** Strongly-typed identifier of a {@link Cliente} aggregate. */
public record ClienteId(UUID value) {

    public ClienteId {
        if (value == null) {
            throw new IllegalArgumentException("ClienteId value must not be null");
        }
    }

    public static ClienteId of(UUID value) {
        return new ClienteId(value);
    }

    public static ClienteId of(String value) {
        return new ClienteId(UUID.fromString(value));
    }

    public static ClienteId novo() {
        return new ClienteId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
