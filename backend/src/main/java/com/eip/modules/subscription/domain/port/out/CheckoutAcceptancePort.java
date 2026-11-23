package com.eip.modules.subscription.domain.port.out;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Outbound port recording the legal acceptances given at checkout (tenant-scoped, RLS).
 */
public interface CheckoutAcceptancePort {

    void record(Acceptance acceptance);

    record Acceptance(UUID id, UUID organizationId, UUID userId, String termsVersion,
            String privacyVersion, boolean billingConsent, String ip, String userAgent,
            OffsetDateTime acceptedAt) {
    }
}
