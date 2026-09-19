package com.eip.modules.logistics.adapter.out.persistence;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * JPA entity mapping for the {@code embarque} table.
 */
@Entity
@Table(name = "embarque")
@Getter
@Setter
@NoArgsConstructor
public class EmbarqueEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "export_id")
    private UUID exportId;

    private String reference;

    private String status;

    @Column(name = "porto_origem_id")
    private UUID portoOrigemId;

    @Column(name = "porto_destino_id")
    private UUID portoDestinoId;

    @Column(name = "navio_id")
    private UUID navioId;

    @Column(name = "transportadora_id")
    private UUID transportadoraId;

    private LocalDate etd;

    private LocalDate eta;

    private String modal;

    @Version
    private long version;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "embarque", cascade = CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ContainerEntity> containers = new ArrayList<>();
}
