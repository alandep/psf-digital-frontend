package com.eip.modules.ai.adapter.out.persistence;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.ai.domain.port.out.QuotaPort;

import lombok.RequiredArgsConstructor;

/**
 * Quota adapter reading the shared {@code subscription_usage} table as a read
 * model (see {@link SubscriptionUsageReadEntity}). Keeps the AI module free of
 * any dependency on the Subscription module while still enforcing franquia.
 */
@Component
@RequiredArgsConstructor
public class QuotaAdapter implements QuotaPort {

    private final SubscriptionUsageReadRepository jpa;

    @Override
    public List<Quota> forOrg(UUID org) {
        return jpa.findByOrganizationId(org).stream()
                .map(e -> new Quota(e.getFeature(), e.getUsed(), e.getIncluded()))
                .toList();
    }

    /**
     * Returns whether the feature meter still has room. Absence of a meter row
     * is treated as "allow" (unmetered / not yet provisioned).
     */
    @Override
    public boolean hasRemaining(UUID org, String feature) {
        return jpa.findByOrganizationId(org).stream()
                .filter(e -> feature.equalsIgnoreCase(e.getFeature()))
                .findFirst()
                .map(e -> {
                    BigDecimal used = e.getUsed() != null ? e.getUsed() : BigDecimal.ZERO;
                    BigDecimal included = e.getIncluded();
                    return included == null || used.compareTo(included) < 0;
                })
                .orElse(true);
    }
}
