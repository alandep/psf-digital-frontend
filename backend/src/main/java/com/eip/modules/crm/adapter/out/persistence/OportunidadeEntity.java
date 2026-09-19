package com.eip.modules.crm.adapter.out.persistence;

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
 * JPA entity mapping for the {@code oportunidade} table (V12).
 */
@Entity
@Table(name = "oportunidade")
@Getter
@Setter
@NoArgsConstructor
public class OportunidadeEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "cliente_id", nullable = false)
    private UUID clienteId;

    @Column(nullable = false)
    private String titulo;

    @Column(name = "valor_estimado", precision = 18, scale = 2)
    private BigDecimal valorEstimado;

    private String moeda;

    @Column(nullable = false)
    private String estagio;

    private Integer probabilidade;

    @Column(name = "fechamento_previsto")
    private LocalDate fechamentoPrevisto;

    @Version
    private long version;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
