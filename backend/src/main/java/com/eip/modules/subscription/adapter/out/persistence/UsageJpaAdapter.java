package com.eip.modules.subscription.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.port.out.UsageRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link UsageRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class UsageJpaAdapter implements UsageRepositoryPort {

    private final UsageJpaRepository jpa;

    @Override
    public List<UsageData> forOrg(UUID organizationId) {
        return jpa.findByOrganizationId(organizationId).stream()
                .map(e -> new UsageData(e.getFeature(), e.getLabel(),
                        e.getUsed(), e.getIncluded(), e.getUnit()))
                .toList();
    }
}
