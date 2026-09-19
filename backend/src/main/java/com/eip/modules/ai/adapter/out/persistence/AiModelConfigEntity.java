package com.eip.modules.ai.adapter.out.persistence;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JPA entity mapping the GLOBAL {@code ai_model_config} router catalog
 * (not tenant-scoped, no RLS).
 */
@Entity
@Table(name = "ai_model_config")
@Getter
@Setter
@NoArgsConstructor
public class AiModelConfigEntity {

    @Id
    private UUID id;

    @Column(name = "provider", nullable = false)
    private String provider;

    @Column(name = "model", nullable = false)
    private String model;

    @Column(name = "task", nullable = false)
    private String task;

    @Column(name = "priority", nullable = false)
    private String priority;

    @Column(name = "cost_class")
    private String costClass;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;
}
