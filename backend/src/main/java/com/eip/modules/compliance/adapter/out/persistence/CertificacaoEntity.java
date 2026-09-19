package com.eip.modules.compliance.adapter.out.persistence;

import java.time.LocalDate;
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
 * JPA entity mapping for the {@code certificacao} table (V11).
 */
@Entity
@Table(name = "certificacao")
@Getter
@Setter
@NoArgsConstructor
public class CertificacaoEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "name", nullable = false)
    private String name;

    private String tipo;

    @Column(name = "orgao_emissor")
    private String orgaoEmissor;

    private String numero;

    @Column(nullable = false)
    private String status;

    @Column(name = "emitida_em")
    private LocalDate emitidaEm;

    @Column(name = "valida_ate")
    private LocalDate validaAte;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
