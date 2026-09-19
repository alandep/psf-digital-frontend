package com.eip.modules.compliance.domain.model;

import java.util.UUID;

/** Strongly-typed identifier of a {@link Licenca} aggregate. */
public record LicencaId(UUID value) {

    public LicencaId {
        if (value == null) {
            throw new IllegalArgumentException("LicencaId value must not be null");
        }
    }

    public static LicencaId of(UUID value) {
        return new LicencaId(value);
    }

    public static LicencaId of(String value) {
        return new LicencaId(UUID.fromString(value));
    }

    public static LicencaId novo() {
        return new LicencaId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
