package com.eip.modules.cms.adapter.out.persistence;

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
 * JPA entity mapping for the {@code app_notification} table (V15).
 * Tenant-scoped.
 */
@Entity
@Table(name = "app_notification")
@Getter
@Setter
@NoArgsConstructor
public class AppNotificationEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "user_id")
    private UUID userId;

    private String type;

    @Column(nullable = false)
    private String title;

    private String body;

    @Column(nullable = false)
    private boolean read;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
