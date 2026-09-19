package com.eip.modules.organization.adapter.out.persistence;

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
 * JPA entity mapping for the {@code organization} table.
 */
@Entity
@Table(name = "organization")
@Getter
@Setter
@NoArgsConstructor
public class OrganizationEntity {

    @Id
    private UUID id;

    private String name;

    @Column(name = "owner_user_id")
    private UUID ownerUserId;

    private String status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
