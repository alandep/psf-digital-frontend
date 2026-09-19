package com.eip.modules.cms.domain.model;

import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Access profile (role) aggregate root. Tenant-scoped by {@code organizationId}
 * under RLS. {@code permissions} is stored as JSON text. Pure domain — no
 * Spring/JPA. Optimistic locking is tracked with {@code version}.
 */
public final class AccessProfile {

    private final UUID id;
    private final UUID organizationId;
    private String name;
    private String description;
    private final String color;
    private final boolean isSystem;
    private String permissions;
    private final long version;

    public AccessProfile(UUID id, UUID organizationId, String name, String description,
                         String color, boolean isSystem, String permissions, long version) {
        this.id = id;
        this.organizationId = organizationId;
        this.name = name;
        this.description = description;
        this.color = color;
        this.isSystem = isSystem;
        this.permissions = permissions;
        this.version = version;
    }

    /** Creates a new non-system access profile. */
    public static AccessProfile novo(UUID org, String name, String description,
                                     String color, String permissions) {
        if (name == null || name.isBlank()) {
            throw new BusinessRuleException("Nome do perfil de acesso e obrigatorio");
        }
        return new AccessProfile(UUID.randomUUID(), org, name, description, color,
                false, permissions, 0L);
    }

    /** Renames the profile. */
    public void renomear(String name, String description) {
        if (name == null || name.isBlank()) {
            throw new BusinessRuleException("Nome do perfil de acesso e obrigatorio");
        }
        this.name = name;
        this.description = description;
    }

    /** Replaces the permissions JSON payload. */
    public void alterarPermissoes(String permissions) {
        this.permissions = permissions;
    }

    public UUID id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public String name() {
        return name;
    }

    public String description() {
        return description;
    }

    public String color() {
        return color;
    }

    public boolean isSystem() {
        return isSystem;
    }

    public String permissions() {
        return permissions;
    }

    public long version() {
        return version;
    }
}
