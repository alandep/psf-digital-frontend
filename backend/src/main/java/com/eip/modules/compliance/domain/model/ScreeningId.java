package com.eip.modules.compliance.domain.model;

import java.util.UUID;

/** Strongly-typed identifier of a {@link Screening} aggregate. */
public record ScreeningId(UUID value) {

    public ScreeningId {
        if (value == null) {
            throw new IllegalArgumentException("ScreeningId value must not be null");
        }
    }

    public static ScreeningId of(UUID value) {
        return new ScreeningId(value);
    }

    public static ScreeningId of(String value) {
        return new ScreeningId(UUID.fromString(value));
    }

    public static ScreeningId novo() {
        return new ScreeningId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
