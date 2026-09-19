package com.eip.modules.cms.domain.model;

import java.util.UUID;

/**
 * In-app notification. Tenant-scoped by {@code organizationId} under RLS. Pure
 * domain — no Spring/JPA.
 */
public final class AppNotification {

    private final UUID id;
    private final UUID organizationId;
    private final UUID userId;
    private final String type;
    private final String title;
    private final String body;
    private boolean read;

    public AppNotification(UUID id, UUID organizationId, UUID userId, String type,
                           String title, String body, boolean read) {
        this.id = id;
        this.organizationId = organizationId;
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.body = body;
        this.read = read;
    }

    /** Marks the notification as read. */
    public void marcarLida() {
        this.read = true;
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

    public String type() {
        return type;
    }

    public String title() {
        return title;
    }

    public String body() {
        return body;
    }

    public boolean read() {
        return read;
    }
}
