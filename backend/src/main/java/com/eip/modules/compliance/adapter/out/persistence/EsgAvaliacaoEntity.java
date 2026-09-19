package com.eip.modules.compliance.adapter.out.persistence;

import java.math.BigDecimal;
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
 * JPA entity mapping for the {@code esg_avaliacao} table (V11).
 */
@Entity
@Table(name = "esg_avaliacao")
@Getter
@Setter
@NoArgsConstructor
public class EsgAvaliacaoEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false)
    private String periodo;

    @Column(name = "score_ambiental", precision = 5, scale = 2)
    private BigDecimal scoreAmbiental;

    @Column(name = "score_social", precision = 5, scale = 2)
    private BigDecimal scoreSocial;

    @Column(name = "score_governanca", precision = 5, scale = 2)
    private BigDecimal scoreGovernanca;

    @Column(name = "score_total", precision = 5, scale = 2)
    private BigDecimal scoreTotal;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
