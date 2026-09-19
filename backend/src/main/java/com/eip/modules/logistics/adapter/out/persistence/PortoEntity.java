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
 * JPA entity mapping for the {@code porto} registry table.
 */
@Entity
@Table(name = "porto")
@Getter
@Setter
@NoArgsConstructor
public class PortoEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    private String code;

    private String name;

    private String country;
}
