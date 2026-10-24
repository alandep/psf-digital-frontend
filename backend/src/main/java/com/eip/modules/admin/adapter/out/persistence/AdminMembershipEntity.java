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

/** Admin-module view of the {@code organization_membership} table for user management + signup. */
@Entity(name = "AdminMembership")
@Table(name = "organization_membership")
@Getter
@Setter
@NoArgsConstructor
public class AdminMembershipEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "user_id")
    private UUID userId;

    private String role;

    private String status;

    @Column(name = "joined_at")
    private OffsetDateTime joinedAt;

    private String department;

    @Column(name = "mfa_enabled")
    private boolean mfaEnabled;
}