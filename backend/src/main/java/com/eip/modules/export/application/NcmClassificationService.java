package com.eip.modules.export.application;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.export.adapter.out.persistence.NcmClassificationEntity;
import com.eip.modules.export.adapter.out.persistence.NcmClassificationJpaRepository;
import com.eip.modules.export.domain.port.in.NcmClassificationUseCase;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/** Application service for NCM classification listing and persistence. */
@Service
@RequiredArgsConstructor
public class NcmClassificationService implements NcmClassificationUseCase {

    private final NcmClassificationJpaRepository repo;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NcmClassificationView> listar() {
        return repo.findByOrganizationIdOrderByCreatedAtDesc(currentOrg()).stream()
                .map(NcmClassificationService::toView)
                .toList();
    }

    @Override
    @Transactional
    public NcmClassificationView salvar(SalvarNcmClassificationCommand cmd) {
        if (cmd.productName() == null || cmd.productName().isBlank()) {
            throw new BusinessRuleException("Nome do produto e obrigatorio");
        }

        OffsetDateTime now = OffsetDateTime.now();
        NcmClassificationEntity e;
        if (cmd.id() != null) {
            e = repo.findByIdAndOrganizationId(cmd.id(), currentOrg())
                    .orElseThrow(() -> new ResourceNotFoundException("Classificacao NCM nao encontrada"));
        } else {
            e = new NcmClassificationEntity();
            e.setId(UUID.randomUUID());
            e.setOrganizationId(currentOrg());
            e.setCreatedAt(now);
            e.setCreatedBy(cmd.createdBy());
        }

        apply(e, cmd);
        e.setUpdatedAt(now);

        NcmClassificationEntity saved = repo.save(e);
        return toView(saved);
    }

    private static void apply(NcmClassificationEntity e, SalvarNcmClassificationCommand cmd) {
        e.setProductId(cmd.productId());
        e.setProductName(cmd.productName());
        e.setProductCode(cmd.productCode());
        e.setProductDescription(cmd.productDescription());
        e.setScientificName(cmd.scientificName());
        e.setCommodityType(cmd.commodityType());
        e.setOriginCountry(cmd.originCountry());
        e.setNcmCode(cmd.ncmCode());
        e.setNcmDescription(cmd.ncmDescription());
        e.setHsCode(cmd.hsCode());
        e.setHsDescription(cmd.hsDescription());
        e.setExportTax(cmd.exportTax());
        e.setExportLicenseRequired(cmd.exportLicenseRequired());
        e.setExportLicenseType(cmd.exportLicenseType());
        e.setLpcoRequired(cmd.lpcoRequired());
        e.setLpcoType(cmd.lpcoType());
        e.setRequiresInspection(cmd.requiresInspection());
        e.setInspectionAgency(cmd.inspectionAgency());
        e.setExportRestriction(cmd.exportRestriction());
        e.setRestrictionDescription(cmd.restrictionDescription());
        e.setAiSuggestedNcm(cmd.aiSuggestedNcm());
        e.setAiConfidenceScore(cmd.aiConfidenceScore());
        e.setAiClassificationReason(cmd.aiClassificationReason());
        e.setAiRequiresHumanReview(cmd.aiRequiresHumanReview());
        e.setAiClassificationStatus(cmd.aiClassificationStatus());
        e.setComplianceStatus(cmd.complianceStatus());
        e.setClassificationSource(cmd.classificationSource());
        e.setApprovalStatus(
                cmd.approvalStatus() == null || cmd.approvalStatus().isBlank()
                        ? "PENDING"
                        : cmd.approvalStatus());
    }

    private static NcmClassificationView toView(NcmClassificationEntity e) {
        return new NcmClassificationView(
                e.getId(),
                e.getProductId(),
                e.getProductName(),
                e.getProductCode(),
                e.getProductDescription(),
                e.getScientificName(),
                e.getCommodityType(),
                e.getOriginCountry(),
                e.getNcmCode(),
                e.getNcmDescription(),
                e.getHsCode(),
                e.getHsDescription(),
                e.getExportTax(),
                e.isExportLicenseRequired(),
                e.getExportLicenseType(),
                e.isLpcoRequired(),
                e.getLpcoType(),
                e.isRequiresInspection(),
                e.getInspectionAgency(),
                e.isExportRestriction(),
                e.getRestrictionDescription(),
                e.getAiSuggestedNcm(),
                e.getAiConfidenceScore(),
                e.getAiClassificationReason(),
                e.isAiRequiresHumanReview(),
                e.getAiClassificationStatus(),
                e.getComplianceStatus(),
                e.getClassificationSource(),
                e.getApprovalStatus(),
                e.getCreatedBy(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }
}
