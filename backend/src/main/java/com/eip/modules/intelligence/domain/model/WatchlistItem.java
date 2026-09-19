package com.eip.modules.intelligence.domain.model;

import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Tenant watchlist entry aggregate. Tenant-scoped by {@code organizationId}.
 * Pure domain — no Spring/JPA.
 */
public final class WatchlistItem {

    private final UUID id;
    private final UUID organizationId;
    private final UUID userId;
    private final WatchTargetType type;
    private final String label;
    private boolean active;

    public WatchlistItem(UUID id, UUID organizationId, UUID userId, WatchTargetType type,
                         String label, boolean active) {
        this.id = id;
        this.organizationId = organizationId;
        this.userId = userId;
        this.type = type;
        this.label = label;
        this.active = active;
    }

    /** Creates a new active watchlist entry. */
    public static WatchlistItem novo(UUID org, UUID userId, WatchTargetType type, String label) {
        if (type == null) {
            throw new BusinessRuleException("Tipo do item da watchlist e obrigatorio");
        }
        if (label == null || label.isBlank()) {
            throw new BusinessRuleException("Rotulo do item da watchlist e obrigatorio");
        }
        return new WatchlistItem(UUID.randomUUID(), org, userId, type, label, true);
    }

    /** Toggles the active flag. */
    public void toggle() {
        this.active = !this.active;
    }

    public UUID id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public UUID userId() {
        return userId;
    }

    public WatchTargetType type() {
        return type;
    }

    public String label() {
        return label;
    }

    public boolean active() {
        return active;
    }
}
