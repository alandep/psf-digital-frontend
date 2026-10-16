package com.eip.modules.entitlement.domain.port.in;

import java.util.UUID;

/**
 * Inbound port: apply a plan's entitlement matrix to an organization. Called
 * during tenant onboarding (empresa creation) and whenever the plan changes.
 * Snapshots the global {@code plan_feature} rows into
 * {@code organization_entitlement} for the given org (upsert semantics).
 */
public interface AplicarEntitlementsUseCase {

    /**
     * @param organizationId target org
     * @param planCode       plan code (START/BUSINESS/PRO/ENTERPRISE)
     * @return number of entitlement rows applied
     */
    int aplicarPlano(UUID organizationId, String planCode);
}