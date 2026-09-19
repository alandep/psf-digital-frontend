package com.eip.modules.crm.adapter.out.persistence;

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
 * JPA entity mapping for the {@code crm_cliente} table (V12). The table has no
 * optimistic-lock column, so this entity carries no {@code @Version} field.
 */
@Entity
@Table(name = "crm_cliente")
@Getter
@Setter
@NoArgsConstructor
public class ClienteEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false)
    private String name;

    private String cnpj;

    private String segmento;

    private String pais;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
