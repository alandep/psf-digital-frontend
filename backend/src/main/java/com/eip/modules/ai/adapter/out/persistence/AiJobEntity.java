package com.eip.modules.ai.adapter.out.persistence;

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
 * JPA entity mapping the tenant-scoped {@code ai_job} queue table
 * (RLS-protected by {@code organization_id}).
 */
@Entity
@Table(name = "ai_job")
@Getter
@Setter
@NoArgsConstructor
public class AiJobEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "task", nullable = false)
    private String task;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "input_ref")
    private String inputRef;

    @Column(name = "result_ref")
    private String resultRef;

    @Column(name = "error")
    private String error;

    @Column(name = "attempts", nullable = false)
    private int attempts;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "available_at")
    private OffsetDateTime availableAt;

    @Column(name = "processed_at")
    private OffsetDateTime processedAt;
}
