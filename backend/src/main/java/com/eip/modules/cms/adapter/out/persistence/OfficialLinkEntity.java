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
 * JPA entity mapping for the {@code official_link} table (V15). GLOBAL.
 */
@Entity
@Table(name = "official_link")
@Getter
@Setter
@NoArgsConstructor
public class OfficialLinkEntity {

    @Id
    private UUID id;

    private String category;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String url;

    private String country;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
