package com.eip.platform.tenant;

import java.util.UUID;

/**
 * Strongly-typed identifier of an organization (tenant).
 *
 * <p>Wrapping the raw {@link UUID} avoids accidental mixing of identifiers of
 * different aggregates and gives the tenant boundary a first-class type.
 */
public record OrganizationId(UUID value) {

    public OrganizationId {
        if (value == null) {
            throw new IllegalArgumentException("OrganizationId value must not be null");
        }
    }

    public static OrganizationId of(UUID value) {
        return new OrganizationId(value);
    }

    public static OrganizationId of(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("OrganizationId value must not be blank");
        }
        return new OrganizationId(UUID.fromString(value));
    }

    /** Returns the canonical string form of the underlying UUID. */
    public String asString() {
        return value.toString();
    }
}
