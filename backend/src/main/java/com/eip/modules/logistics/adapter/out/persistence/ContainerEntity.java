package com.eip.modules.logistics.adapter.out.persistence;

import java.math.BigDecimal;
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
 * JPA entity mapping for the {@code container} table.
 */
@Entity
@Table(name = "container")
@Getter
@Setter
@NoArgsConstructor
public class ContainerEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "embarque_id", nullable = false)
    private EmbarqueEntity embarque;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    private String numero;

    private String tipo;

    @Column(precision = 18, scale = 2)
    private BigDecimal tara;
}
