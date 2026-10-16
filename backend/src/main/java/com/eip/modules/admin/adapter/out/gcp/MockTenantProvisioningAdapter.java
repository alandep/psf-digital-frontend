package com.eip.modules.admin.adapter.out.gcp;

import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.eip.modules.admin.domain.port.out.TenantProvisioningPort;

import lombok.extern.slf4j.Slf4j;

/**
 * Local/dev tenant provisioning: returns a DETERMINISTIC mock tenantId derived
 * from the organization UUID, without calling GCP. Active whenever the
 * {@code cloud} profile is NOT enabled, mirroring {@code MockStorageAdapter} /
 * {@code MockAiGatewayAdapter}. This keeps empresa onboarding fully functional
 * offline; the real GCP tenant is created only under the {@code cloud} profile.
 */
@Component
@Profile("!cloud")
@Slf4j
public class MockTenantProvisioningAdapter implements TenantProvisioningPort {

    @Override
    public String provisionTenant(UUID organizationId, String displayName) {
        // Stable, collision-free mock id so repeated local runs are idempotent.
        String tenantId = "mock-tenant-" + organizationId.toString().substring(0, 8);
        log.info("[MOCK] Tenant GCP provisionado para org {} (\"{}\") -> {}",
                organizationId, displayName, tenantId);
        return tenantId;
    }
}