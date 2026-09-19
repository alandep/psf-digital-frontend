package com.eip.modules.logistics.domain.model;

import java.util.UUID;

/**
 * Strongly-typed identifier of an {@link Embarque} aggregate.
 */
public record EmbarqueId(UUID value) {

    public EmbarqueId {
        if (value == null) {
            throw new IllegalArgumentException("EmbarqueId value must not be null");
        }
    }

    public static EmbarqueId of(UUID value) {
        return new EmbarqueId(value);
    }

    public static EmbarqueId of(String value) {
        return new EmbarqueId(UUID.fromString(value));
    }

    public static EmbarqueId novo() {
        return new EmbarqueId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
