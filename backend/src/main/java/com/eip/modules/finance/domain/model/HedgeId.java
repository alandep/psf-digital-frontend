package com.eip.modules.finance.domain.model;

import java.util.UUID;

/** Strongly-typed identifier of a {@link HedgeContrato} aggregate. */
public record HedgeId(UUID value) {

    public HedgeId {
        if (value == null) {
            throw new IllegalArgumentException("HedgeId value must not be null");
        }
    }

    public static HedgeId of(UUID value) {
        return new HedgeId(value);
    }

    public static HedgeId of(String value) {
        return new HedgeId(UUID.fromString(value));
    }

    public static HedgeId novo() {
        return new HedgeId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
