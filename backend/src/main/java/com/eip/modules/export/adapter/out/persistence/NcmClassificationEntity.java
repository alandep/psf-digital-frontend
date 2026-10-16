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

/** JPA entity for the {@code ncm_classification} table. */
@Entity
@Table(name = "ncm_classification")
@Getter
@Setter
@NoArgsConstructor
public class NcmClassificationEntity {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "product_id")
    private String productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "product_code")
    private String productCode;

    @Column(name = "product_description")
    private String productDescription;

    @Column(name = "scientific_name")
    private String scientificName;

    @Column(name = "commodity_type")
    private String commodityType;

    @Column(name = "origin_country")
    private String originCountry;

    @Column(name = "ncm_code")
    private String ncmCode;

    @Column(name = "ncm_description")
    private String ncmDescription;

    @Column(name = "hs_code")
    private String hsCode;

    @Column(name = "hs_description")
    private String hsDescription;

    @Column(name = "export_tax", precision = 6, scale = 2)
    private BigDecimal exportTax;

    @Column(name = "export_license_required", nullable = false)
    private boolean exportLicenseRequired;

    @Column(name = "export_license_type")
    private String exportLicenseType;

    @Column(name = "lpco_required", nullable = false)
    private boolean lpcoRequired;

    @Column(name = "lpco_type")
    private String lpcoType;

    @Column(name = "requires_inspection", nullable = false)
    private boolean requiresInspection;

    @Column(name = "inspection_agency")
    private String inspectionAgency;

    @Column(name = "export_restriction", nullable = false)
    private boolean exportRestriction;

    @Column(name = "restriction_description")
    private String restrictionDescription;

    @Column(name = "ai_suggested_ncm")
    private String aiSuggestedNcm;

    @Column(name = "ai_confidence_score", precision = 6, scale = 2)
    private BigDecimal aiConfidenceScore;

    @Column(name = "ai_classification_reason")
    private String aiClassificationReason;

    @Column(name = "ai_requires_human_review", nullable = false)
    private boolean aiRequiresHumanReview;

    @Column(name = "ai_classification_status")
    private String aiClassificationStatus;

    @Column(name = "compliance_status")
    private String complianceStatus;

    @Column(name = "classification_source")
    private String classificationSource;

    @Column(name = "approval_status", nullable = false)
    private String approvalStatus;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
