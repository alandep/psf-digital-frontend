package com.eip.modules.subscription.domain.port.out;

import java.util.Optional;
import java.util.UUID;

/**
 * Global (no RLS) index from gateway ids ({@code cus_...}, {@code sub_...},
 * {@code addon:<uuid>}) to the owning organization, used by the webhook.
 */
public interface BillingGatewayRefPort {

    String KIND_CUSTOMER = "CUSTOMER";
    String KIND_SUBSCRIPTION = "SUBSCRIPTION";
    String KIND_ADDON = "ADDON";

    /** Registers (or re-points) a gateway id to an organization. */
    void register(String gatewayId, String kind, UUID organizationId);

    Optional<UUID> organizationOf(String gatewayId);
}
