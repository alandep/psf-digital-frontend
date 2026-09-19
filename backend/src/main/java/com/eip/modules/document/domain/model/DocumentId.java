package com.eip.modules.document.domain.model;

import java.util.UUID;

/**
 * Strongly-typed identifier of a {@link Document} aggregate.
 */
public record DocumentId(UUID value) {

    public DocumentId {
        if (value == null) {
            throw new IllegalArgumentException("DocumentId value must not be null");
        }
    }

    public static DocumentId of(UUID value) {
        return new DocumentId(value);
    }

    public static DocumentId of(String value) {
        return new DocumentId(UUID.fromString(value));
    }

    public static DocumentId novo() {
        return new DocumentId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
