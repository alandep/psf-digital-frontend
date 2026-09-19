package com.eip.modules.crm.domain.model;

/** Lifecycle status of a {@link Lead} along the conversion funnel. */
public enum LeadStatus {
    NEW,
    CONTACTED,
    QUALIFIED,
    TRIAL,
    CUSTOMER,
    LOST
}
