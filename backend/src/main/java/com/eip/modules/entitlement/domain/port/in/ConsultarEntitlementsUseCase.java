package com.eip.modules.entitlement.domain.port.in;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Inbound port: read the entitlements applied to an organization. */
public interface ConsultarEntitlementsUseCase {

    List<EntitlementView> listar(UUID organizationId);

    /**
     * Read view of a single entitlement. {@code limitValue == null} means
     * unlimited (for {@code limit.*} keys) or not-applicable (for {@code mod.*}).
     */
    record EntitlementView(String featureKey, boolean enabled, BigDecimal limitValue, String appliedPlan) {
    }
}