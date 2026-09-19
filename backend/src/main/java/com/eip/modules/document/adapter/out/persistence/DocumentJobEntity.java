package com.eip.modules.document.adapter.out.persistence;

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
 * JPA entity mapping for the {@code document_job} table.
 */
@Entity
@Table(name = "document_job")
@Getter
@Setter
@NoArgsConstructor
public class DocumentJobEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "document_id")
    private UUID documentId;

    @Column(name = "job_type", nullable = false)
    private String jobType;

    @Column(nullable = false)
    private String status;

    @Column(name = "result_ref")
    private String resultRef;

    private String error;

    @Column(nullable = false)
    private int attempts;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "available_at")
    private OffsetDateTime availableAt;

    @Column(name = "processed_at")
    private OffsetDateTime processedAt;
}
