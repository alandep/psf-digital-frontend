package com.eip.modules.finance.adapter.out.persistence;

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
 * JPA entity mapping for the {@code hedge_contrato} table (V10).
 */
@Entity
@Table(name = "hedge_contrato")
@Getter
@Setter
@NoArgsConstructor
public class HedgeContratoEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    private String instrumento;

    @Column(nullable = false)
    private String moeda;

    @Column(name = "notional", nullable = false, precision = 18, scale = 2)
    private BigDecimal notional;

    @Column(name = "strike", precision = 18, scale = 6)
    private BigDecimal strike;

    private LocalDate vencimento;

    @Column(nullable = false)
    private String status;

    @Version
    private long version;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
