package com.eip.modules.admin.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Admin-module view of the {@code organization} table. Distinct entity class
 * (not RLS-scoped) so the admin surface can list/manage all tenants without
 * reaching into the Organization module internals.
 */
@Entity(name = "AdminOrganization")
@Table(name = "organization")
@Getter
@Setter
@NoArgsConstructor
public class AdminOrganizationEntity {

    @Id
    private UUID id;

    private String name;

    @Column(name = "owner_user_id")
    private UUID ownerUserId;

    private String status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "gcp_tenant_id")
    private String gcpTenantId;
}