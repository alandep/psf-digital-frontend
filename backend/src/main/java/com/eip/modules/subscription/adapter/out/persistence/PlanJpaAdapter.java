package com.eip.modules.subscription.adapter.out.persistence;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.port.out.PlanRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link PlanRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class PlanJpaAdapter implements PlanRepositoryPort {

    private final PlanJpaRepository jpa;

    @Override
    public List<PlanData> activePlans() {
        return jpa.findByActiveTrue().stream().map(PlanJpaAdapter::toData).toList();
    }

    @Override
    public Optional<PlanData> byCode(String code) {
        return jpa.findById(code).map(PlanJpaAdapter::toData);
    }

    private static PlanData toData(PlanEntity e) {
        return new PlanData(e.getCode(), e.getName(), e.getDescription(),
                e.getMonthlyPrice(), e.getAnnualPrice(), e.isHighlighted());
    }
}
