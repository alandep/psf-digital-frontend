package com.eip.modules.cms.domain.model;

/** Lifecycle status of an advertising campaign. {@code ENDED} is terminal. */
public enum AdCampaignStatus {
    DRAFT,
    PENDING_APPROVAL,
    ACTIVE,
    PAUSED,
    ENDED
}
