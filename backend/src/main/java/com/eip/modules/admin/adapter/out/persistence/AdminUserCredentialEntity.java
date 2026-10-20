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

/** Admin-module view of the {@code user_credential} table for public signup. */
@Entity(name = "AdminUserCredential")
@Table(name = "user_credential")
@Getter
@Setter
@NoArgsConstructor
public class AdminUserCredentialEntity {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "must_change_password")
    private boolean mustChangePassword;

    @Column(name = "failed_attempts")
    private int failedAttempts;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}