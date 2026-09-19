package com.eip.modules.bi.domain.model;

import java.util.UUID;

/** Strongly-typed identifier of a {@link Dashboard} aggregate. */
public record DashboardId(UUID value) {

    public DashboardId {
        if (value == null) {
            throw new IllegalArgumentException("DashboardId value must not be null");
        }
    }

    public static DashboardId of(UUID value) {
        return new DashboardId(value);
    }

    public static DashboardId of(String value) {
        return new DashboardId(UUID.fromString(value));
    }

    public static DashboardId novo() {
        return new DashboardId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
