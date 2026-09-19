package com.eip.modules.intelligence.adapter.out.persistence;

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
 * JPA entity mapping for the {@code watchlist_item} table (V13). Tenant-scoped.
 */
@Entity
@Table(name = "watchlist_item")
@Getter
@Setter
@NoArgsConstructor
public class WatchlistItemEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
