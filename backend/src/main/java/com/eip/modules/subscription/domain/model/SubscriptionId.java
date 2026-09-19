package com.eip.modules.subscription.domain.model;

import java.util.UUID;

/**
 * Strongly-typed identifier of a subscription aggregate.
 */
public record SubscriptionId(UUID value) {

    public SubscriptionId {
        if (value == null) {
            throw new IllegalArgumentException("SubscriptionId value must not be null");
        }
    }

    public static SubscriptionId of(UUID value) {
        return new SubscriptionId(value);
    }

    public static SubscriptionId of(String value) {
        return new SubscriptionId(UUID.fromString(value));
    }

    public static SubscriptionId newId() {
        return new SubscriptionId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
