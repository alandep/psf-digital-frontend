package com.eip.modules.export.adapter.out.persistence;

import java.math.BigDecimal;
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
 * JPA entity mapping for the {@code export} table.
 */
@Entity
@Table(name = "export")
@Getter
@Setter
@NoArgsConstructor
public class ExportacaoEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "legal_entity_id")
    private UUID legalEntityId;

    @Column(name = "customer_id")
    private UUID customerId;

    private String reference;

    private String status;

    @Column(name = "destination_country")
    private String destinationCountry;

    private String incoterm;

    @Column(name = "total_amount", precision = 18, scale = 2)
    private BigDecimal totalAmount;

    private String currency;

    @Version
    private long version;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "export", cascade = CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ExportItemEntity> itens = new ArrayList<>();
}
