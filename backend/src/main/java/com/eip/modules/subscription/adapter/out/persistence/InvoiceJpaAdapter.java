package com.eip.modules.subscription.adapter.out.persistence;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.port.out.InvoiceRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link InvoiceRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class InvoiceJpaAdapter implements InvoiceRepositoryPort {

    private final InvoiceJpaRepository jpa;

    @Override
    public List<InvoiceData> forOrg(UUID organizationId) {
        return jpa.findByOrganizationIdOrderByIssuedAtDesc(organizationId).stream()
                .map(e -> new InvoiceData(e.getId(), e.getNumber(), e.getPeriod(),
                        e.getPlanName(), e.getAmount(), e.getStatus(), e.getIssuedAt()))
                .toList();
    }
}
