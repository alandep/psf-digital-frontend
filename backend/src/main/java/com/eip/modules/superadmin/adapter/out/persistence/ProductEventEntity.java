package com.eip.modules.superadmin.adapter.out.persistence;

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
 * JPA entity mapping for the tenant-scoped {@code product_event} table (V16).
 */
@Entity
@Table(name = "product_event")
@Getter
@Setter
@NoArgsConstructor
public class ProductEventEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "event", nullable = false)
    private String event;

    @Column(name = "properties")
    private String properties;

    @Column(name = "occurred_at", nullable = false)
    private OffsetDateTime occurredAt;
}
