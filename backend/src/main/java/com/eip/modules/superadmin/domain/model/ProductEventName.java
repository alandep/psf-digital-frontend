package com.eip.modules.superadmin.domain.model;

/**
 * Canonical product analytics events tracked in the {@code product_event}
 * ledger (V16). Pure domain enum: no framework dependency.
 *
 * <p>These are the twelve events feeding the commercial funnel and the
 * product-events screen.
 */
public enum ProductEventName {

    SIGNUP_STARTED,
    SIGNUP_COMPLETED,
    PLAN_VIEWED,
    CHECKOUT_STARTED,
    CHECKOUT_COMPLETED,
    ONBOARDING_STARTED,
    PRODUCT_CREATED,
    CUSTOMER_CREATED,
    EXPORT_CREATED,
    FIRST_EXPORT_CREATED,
    DOCUMENT_GENERATED,
    AI_USED
}
