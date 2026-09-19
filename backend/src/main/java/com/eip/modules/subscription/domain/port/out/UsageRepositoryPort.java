package com.eip.modules.subscription.domain.port.out;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Outbound port for usage meters.
 */
public interface UsageRepositoryPort {

    List<UsageData> forOrg(UUID organizationId);

    record UsageData(String feature, String label, BigDecimal used,
            BigDecimal included, String unit) {
    }
}
