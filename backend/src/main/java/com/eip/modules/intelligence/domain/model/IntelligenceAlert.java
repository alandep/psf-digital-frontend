package com.eip.modules.intelligence.domain.model;

import java.util.UUID;

/**
 * Tenant intelligence alert aggregate. Tenant-scoped by {@code organizationId}.
 * Pure domain — no Spring/JPA.
 */
public final class IntelligenceAlert {

    private final UUID id;
    private final UUID organizationId;
    private final String title;
    private final ImpactLevel impactLevel;
    private final String relatedTo;
    private final int affectedOperations;
    private final String summary;
    private boolean read;

    public IntelligenceAlert(UUID id, UUID organizationId, String title, ImpactLevel impactLevel,
                             String relatedTo, int affectedOperations, String summary,
                             boolean read) {
        this.id = id;
        this.organizationId = organizationId;
        this.title = title;
        this.impactLevel = impactLevel;
        this.relatedTo = relatedTo;
        this.affectedOperations = affectedOperations;
        this.summary = summary;
        this.read = read;
    }

    /** Marks the alert as read. */
    public void marcarLida() {
        this.read = true;
    }

    public UUID id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public String title() {
        return title;
    }

    public ImpactLevel impactLevel() {
        return impactLevel;
    }

    public String relatedTo() {
        return relatedTo;
    }

    public int affectedOperations() {
        return affectedOperations;
    }

    public String summary() {
        return summary;
    }

    public boolean read() {
        return read;
    }
}
