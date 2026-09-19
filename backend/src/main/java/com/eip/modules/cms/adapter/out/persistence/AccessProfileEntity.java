package com.eip.modules.cms.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JPA entity mapping for the {@code access_profile} table (V15). Tenant-scoped.
 */
@Entity
@Table(name = "access_profile")
@Getter
@Setter
@NoArgsConstructor
public class AccessProfileEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false)
    private String name;

    private String description;

    private String color;

    @Column(name = "is_system", nullable = false)
    private boolean isSystem;

    @Column(name = "permissions")
    private String permissions;

    @Version
    private long version;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
