package com.eip.modules.bi.adapter.out.persistence;

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
 * JPA entity mapping for the {@code saved_query} table (V14).
 *
 * <p>The table has no optimistic-lock column, so this entity carries no
 * {@link jakarta.persistence.Version @Version} field.
 */
@Entity
@Table(name = "saved_query")
@Getter
@Setter
@NoArgsConstructor
public class SavedQueryEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false)
    private String name;

    private String dataset;

    @Column(name = "query_json")
    private String queryJson;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
