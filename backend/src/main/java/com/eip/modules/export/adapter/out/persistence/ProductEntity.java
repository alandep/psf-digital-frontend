package com.eip.modules.export.adapter.out.persistence;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** JPA entity for the {@code product} table. */
@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
public class ProductEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    private String name;
    private String ncm;
    private String description;
    private String unit;

    @Column(name = "standard_price", precision = 18, scale = 2)
    private BigDecimal standardPrice;

    private String currency;

    @Column(name = "origin_country")
    private String originCountry;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
