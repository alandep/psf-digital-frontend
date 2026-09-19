package com.eip.modules.cms.adapter.out.persistence;

import java.math.BigDecimal;
import java.time.LocalDate;
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
 * JPA entity mapping for the {@code ad_campaign} table (V15). GLOBAL.
 */
@Entity
@Table(name = "ad_campaign")
@Getter
@Setter
@NoArgsConstructor
public class AdCampaignEntity {

    @Id
    private UUID id;

    @Column(name = "advertiser_id")
    private UUID advertiserId;

    @Column(nullable = false)
    private String name;

    private String placement;

    @Column(name = "start_at")
    private LocalDate startAt;

    @Column(name = "end_at")
    private LocalDate endAt;

    @Column(nullable = false)
    private String status;

    @Column(name = "target_url")
    private String targetUrl;

    @Column(nullable = false)
    private int impressions;

    @Column(nullable = false)
    private int clicks;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal revenue;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
