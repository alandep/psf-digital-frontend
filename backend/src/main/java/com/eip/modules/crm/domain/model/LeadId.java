package com.eip.modules.crm.domain.model;

import java.util.UUID;

/** Strongly-typed identifier of a {@link Lead} aggregate. */
public record LeadId(UUID value) {

    public LeadId {
        if (value == null) {
            throw new IllegalArgumentException("LeadId value must not be null");
        }
    }

    public static LeadId of(UUID value) {
        return new LeadId(value);
    }

    public static LeadId of(String value) {
        return new LeadId(UUID.fromString(value));
    }

    public static LeadId novo() {
        return new LeadId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
