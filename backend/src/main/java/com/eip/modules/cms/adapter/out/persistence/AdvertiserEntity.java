package com.eip.modules.cms.adapter.out.persistence;

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
 * JPA entity mapping for the {@code advertiser} table (V15). GLOBAL.
 */
@Entity
@Table(name = "advertiser")
@Getter
@Setter
@NoArgsConstructor
public class AdvertiserEntity {

    @Id
    private UUID id;

    @Column(name = "legal_name")
    private String legalName;

    @Column(name = "trade_name", nullable = false)
    private String tradeName;

    private String cnpj;

    private String website;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
