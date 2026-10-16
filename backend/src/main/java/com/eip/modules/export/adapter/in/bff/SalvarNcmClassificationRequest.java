package com.eip.modules.export.adapter.in.bff;

import java.math.BigDecimal;
import java.util.UUID;

import com.eip.modules.export.domain.port.in.NcmClassificationUseCase.SalvarNcmClassificationCommand;

import jakarta.validation.constraints.NotBlank;

/** BFF payload to create or update an NCM classification. */
public record SalvarNcmClassificationRequest(
        UUID id,
        String productId,
        @NotBlank String productName,
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
        String approvalStatus) {

    public SalvarNcmClassificationCommand toCommand(String createdBy) {
        return new SalvarNcmClassificationCommand(
                id,
                productId,
                productName,
                productCode,
                productDescription,
                scientificName,
                commodityType,
                originCountry,
                ncmCode,
                ncmDescription,
                hsCode,
                hsDescription,
                exportTax,
                exportLicenseRequired,
                exportLicenseType,
                lpcoRequired,
                lpcoType,
                requiresInspection,
                inspectionAgency,
                exportRestriction,
                restrictionDescription,
                aiSuggestedNcm,
                aiConfidenceScore,
                aiClassificationReason,
                aiRequiresHumanReview,
                aiClassificationStatus,
                complianceStatus,
                classificationSource,
                approvalStatus,
                createdBy);
    }
}
