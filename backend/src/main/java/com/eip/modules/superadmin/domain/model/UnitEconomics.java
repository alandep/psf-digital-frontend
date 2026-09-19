package com.eip.modules.superadmin.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

/**
 * Per-tenant unit economics. Pure domain record with a small factory that
 * derives contribution, margin and a health score.
 *
 * @param organizationId tenant id
 * @param company        tenant/company name
 * @param subscription   subscription revenue (MRR)
 * @param aiCost         AI provider cost consumed by the tenant
 * @param ocrCost        OCR-related cost consumed by the tenant
 * @param contribution   {@code subscription - aiCost - ocrCost}
 * @param marginPercent  contribution margin as an integer percentage
 * @param score          health score: GREEN / YELLOW / RED
 */
public record UnitEconomics(
        UUID organizationId,
        String company,
        BigDecimal subscription,
        BigDecimal aiCost,
        BigDecimal ocrCost,
        BigDecimal contribution,
        int marginPercent,
        String score) {

    /**
     * Builds a {@link UnitEconomics} from raw revenue and costs, computing
     * contribution, margin and the health score. Margin score thresholds:
     * {@code >= 60% GREEN}, {@code >= 30% YELLOW}, otherwise {@code RED}.
     */
    public static UnitEconomics of(UUID organizationId, String company,
                                   BigDecimal subscription, BigDecimal aiCost, BigDecimal ocrCost) {
        BigDecimal sub = subscription == null ? BigDecimal.ZERO : subscription;
        BigDecimal ai = aiCost == null ? BigDecimal.ZERO : aiCost;
        BigDecimal ocr = ocrCost == null ? BigDecimal.ZERO : ocrCost;
        BigDecimal contribution = sub.subtract(ai).subtract(ocr).setScale(2, RoundingMode.HALF_UP);
        int marginPercent = sub.signum() == 0
                ? 0
                : contribution.multiply(BigDecimal.valueOf(100))
                        .divide(sub, 0, RoundingMode.HALF_UP)
                        .intValue();
        String score = marginPercent >= 60 ? "GREEN" : marginPercent >= 30 ? "YELLOW" : "RED";
        return new UnitEconomics(organizationId, company, sub.setScale(2, RoundingMode.HALF_UP),
                ai.setScale(2, RoundingMode.HALF_UP), ocr.setScale(2, RoundingMode.HALF_UP),
                contribution, marginPercent, score);
    }
}
