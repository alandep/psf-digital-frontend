package com.eip.modules.export.domain.port.in;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/** Inbound port: list and persist (create/update) NCM classifications. */
public interface NcmClassificationUseCase {

    List<NcmClassificationView> listar();

    /** Creates the classification when {@code id} is null, otherwise updates it. */
    NcmClassificationView salvar(SalvarNcmClassificationCommand cmd);

    /** Command to create or update an NCM classification. */
    record SalvarNcmClassificationCommand(
            UUID id,
            String productId,
            String productName,
            String productCode,
            String productDescription,
            String scientificName,
            String commodityType,
            String originCountry,
            String ncmCode,
            String ncmDescription,
            String hsCode,
            String hsDescription,
            BigDecimal exportTax,
            boolean exportLicenseRequired,
            String exportLicenseType,
            boolean lpcoRequired,
            String lpcoType,
            boolean requiresInspection,
            String inspectionAgency,
            boolean exportRestriction,
            String restrictionDescription,
            String aiSuggestedNcm,
            BigDecimal aiConfidenceScore,
            String aiClassificationReason,
            boolean aiRequiresHumanReview,
            String aiClassificationStatus,
            String complianceStatus,
            String classificationSource,
            String approvalStatus,
            String createdBy) {
    }

    /** Read view of a persisted NCM classification. */
    record NcmClassificationView(
            UUID id,
            String productId,
            String productName,
            String productCode,
            String productDescription,
            String scientificName,
            String commodityType,
            String originCountry,
            String ncmCode,
            String ncmDescription,
            String hsCode,
            String hsDescription,
            BigDecimal exportTax,
            boolean exportLicenseRequired,
            String exportLicenseType,
            boolean lpcoRequired,
            String lpcoType,
            boolean requiresInspection,
            String inspectionAgency,
            boolean exportRestriction,
            String restrictionDescription,
            String aiSuggestedNcm,
            BigDecimal aiConfidenceScore,
            String aiClassificationReason,
            boolean aiRequiresHumanReview,
            String aiClassificationStatus,
            String complianceStatus,
            String classificationSource,
            String approvalStatus,
            String createdBy,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt) {
    }
}
