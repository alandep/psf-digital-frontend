package com.eip.modules.subscription.domain.port.out;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Outbound port for the global plan catalog.
 */
public interface PlanRepositoryPort {

    List<PlanData> activePlans();

    Optional<PlanData> byCode(String code);

    record PlanData(String code, String name, String description,
            BigDecimal monthlyPrice, BigDecimal annualPrice, boolean highlighted) {
    }
}
