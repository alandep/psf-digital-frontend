package com.eip.modules.finance.adapter.out.persistence;

import java.math.BigDecimal;
import java.time.LocalDate;
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
 * JPA entity mapping for the {@code cambio_contrato} table (V10).
 */
@Entity
@Table(name = "cambio_contrato")
@Getter
@Setter
@NoArgsConstructor
public class CambioContratoEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    private String banco;

    @Column(nullable = false)
    private String moeda;

    @Column(name = "valor", nullable = false, precision = 18, scale = 2)
    private BigDecimal valor;

    @Column(name = "taxa", nullable = false, precision = 18, scale = 6)
    private BigDecimal taxa;

    private String tipo;

    @Column(nullable = false)
    private String status;

    @Column(name = "data_contratacao")
    private LocalDate dataContratacao;

    @Column(name = "data_liquidacao")
    private LocalDate dataLiquidacao;

    @Version
    private long version;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
