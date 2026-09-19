package com.eip.modules.compliance.adapter.out.persistence;

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
 * JPA entity mapping for the {@code screening} table (V11).
 */
@Entity
@Table(name = "screening")
@Getter
@Setter
@NoArgsConstructor
public class ScreeningEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "entity_name", nullable = false)
    private String entityName;

    @Column(name = "entity_type")
    private String entityType;

    private String document;

    @Column(nullable = false)
    private String status;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "lists_checked")
    private String listsChecked;

    @Column(name = "result_summary")
    private String resultSummary;

    @Version
    private long version;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
