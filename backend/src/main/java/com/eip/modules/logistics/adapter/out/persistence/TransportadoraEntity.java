package com.eip.modules.logistics.adapter.out.persistence;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JPA entity mapping for the {@code transportadora} registry table.
 */
@Entity
@Table(name = "transportadora")
@Getter
@Setter
@NoArgsConstructor
public class TransportadoraEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    private String name;

    private String tipo;
}
