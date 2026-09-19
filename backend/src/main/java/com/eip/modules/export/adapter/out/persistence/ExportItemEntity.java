package com.eip.modules.export.adapter.out.persistence;

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
 * JPA entity mapping for the {@code export_item} table.
 */
@Entity
@Table(name = "export_item")
@Getter
@Setter
@NoArgsConstructor
public class ExportItemEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "export_id", nullable = false)
    private ExportacaoEntity export;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "product_id")
    private UUID productId;

    private String description;

    @Column(precision = 18, scale = 3)
    private BigDecimal quantity;

    @Column(name = "unit_price", precision = 18, scale = 2)
    private BigDecimal unitPrice;
}
