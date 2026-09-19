package com.eip.modules.bi.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JPA entity mapping for the {@code dashboard_widget} table (V14).
 */
@Entity
@Table(name = "dashboard_widget")
@Getter
@Setter
@NoArgsConstructor
public class DashboardWidgetEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dashboard_id", nullable = false)
    private DashboardEntity dashboard;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    private String tipo;

    private String titulo;

    private String config;

    private int ordem;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
