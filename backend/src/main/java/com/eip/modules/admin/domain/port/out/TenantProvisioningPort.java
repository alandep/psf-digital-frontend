package com.eip.modules.admin.domain.port.out;

import java.util.UUID;

/**
 * Outbound port: provisions an external GCP Identity Platform tenant for a newly
 * created organization and returns its tenantId. Two adapters implement it,
 * selected by Spring profile (same pattern as the Vertex AI / GCS adapters):
 * a deterministic local mock ({@code @Profile("!cloud")}) and a real GCP
 * adapter ({@code @Profile("cloud")}).
 */
public interface TenantProvisioningPort {

    /**
     * @param organizationId the internal org UUID (authoritative isolation key)
     * @param displayName    human-readable tenant/company name
     * @return the external GCP tenantId to persist on the organization
     */
    String provisionTenant(UUID organizationId, String displayName);
}