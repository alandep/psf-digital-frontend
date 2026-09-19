package com.eip.modules.bi.domain.model;

import java.util.UUID;

/** Strongly-typed identifier of a {@link SavedQuery} aggregate. */
public record SavedQueryId(UUID value) {

    public SavedQueryId {
        if (value == null) {
            throw new IllegalArgumentException("SavedQueryId value must not be null");
        }
    }

    public static SavedQueryId of(UUID value) {
        return new SavedQueryId(value);
    }

    public static SavedQueryId of(String value) {
        return new SavedQueryId(UUID.fromString(value));
    }

    public static SavedQueryId novo() {
        return new SavedQueryId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
