package com.eip.modules.identity.adapter.out.persistence;

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
 * JPA entity mapping for the {@code user_credential} table. Keyed by the owning
 * user id (one credential per user).
 */
@Entity
@Table(name = "user_credential")
@Getter
@Setter
@NoArgsConstructor
public class UserCredentialEntity {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "must_change_password")
    private boolean mustChangePassword;

    @Column(name = "failed_attempts")
    private int failedAttempts;

    @Column(name = "locked_until")
    private OffsetDateTime lockedUntil;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
