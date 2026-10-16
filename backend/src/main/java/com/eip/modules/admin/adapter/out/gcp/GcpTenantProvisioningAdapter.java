package com.eip.modules.admin.adapter.out.gcp;

import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.eip.modules.admin.domain.port.out.TenantProvisioningPort;

import lombok.extern.slf4j.Slf4j;

/**
 * Real GCP Identity Platform tenant provisioning. Active only under the
 * {@code cloud} profile (same gating as {@code GcsStorageAdapter} /
 * {@code VertexAiGatewayAdapter}), so it never runs locally.
 *
 * <p>Identity Platform multi-tenancy is created via the Firebase Admin SDK's
 * {@code TenantManager.createTenant(...)} using Application Default Credentials.
 * The dependency/credentials are only present in the cloud deployment, so the
 * concrete SDK call is encapsulated here and guarded by configuration. If the
 * SDK or project is not configured, this fails fast with a clear message rather
 * than silently returning a fake id (that is the mock adapter's job).
 *
 * <p>NOTE: left as an explicit integration point. The actual
 * {@code FirebaseAuth.getInstance().getTenantManager().createTenant(...)} call
 * must be wired with the Firebase Admin dependency when the cloud build is
 * assembled; until then this adapter throws to avoid pretending it provisioned
 * a tenant.
 */
@Component
@Profile("cloud")
@Slf4j
public class GcpTenantProvisioningAdapter implements TenantProvisioningPort {

    @Override
    public String provisionTenant(UUID organizationId, String displayName) {
        log.info("Provisionando tenant GCP Identity Platform para org {} (\"{}\")",
                organizationId, displayName);
        // Integration point for Firebase Admin SDK TenantManager.createTenant.
        // Intentionally not faked: the cloud assembly must provide the SDK +
        // ADC credentials and complete this call.
        throw new UnsupportedOperationException(
                "Provisionamento real de tenant GCP ainda nao conectado ao Firebase Admin SDK. "
                + "Configurar credenciais/dependencia no build cloud.");
    }
}