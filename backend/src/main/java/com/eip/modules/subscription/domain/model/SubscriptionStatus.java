package com.eip.modules.subscription.domain.model;

/**
 * Lifecycle states of a subscription.
 */
public enum SubscriptionStatus {
    TRIALING, ACTIVE, PAST_DUE, GRACE_PERIOD, SUSPENDED, CANCELED, TERMINATED
}
