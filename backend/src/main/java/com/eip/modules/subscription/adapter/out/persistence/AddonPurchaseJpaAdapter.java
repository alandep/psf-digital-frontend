package com.eip.modules.subscription.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.port.out.AddonPurchaseRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link AddonPurchaseRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class AddonPurchaseJpaAdapter implements AddonPurchaseRepositoryPort {

    private final AddonPurchaseJpaRepository jpa;

    @Override
    public Optional<AddonPurchaseData> byId(UUID id) {
        return jpa.findById(id).map(AddonPurchaseJpaAdapter::toData);
    }

    @Override
    public AddonPurchaseData save(AddonPurchaseData d) {
        AddonPurchaseEntity e = jpa.findById(d.id()).orElseGet(() -> {
            AddonPurchaseEntity created = new AddonPurchaseEntity();
            created.setId(d.id());
            created.setCreatedAt(d.createdAt() != null ? d.createdAt() : OffsetDateTime.now());
            return created;
        });
        e.setOrganizationId(d.organizationId());
        e.setAddonCode(d.addonCode());
        e.setAiCredits(d.aiCredits());
        e.setOcrPages(d.ocrPages());
        e.setAmount(d.amount());
        e.setStatus(d.status());
        e.setBillingType(d.billingType());
        e.setInvoiceId(d.invoiceId());
        e.setAsaasPaymentId(d.asaasPaymentId());
        e.setPeriodStart(d.periodStart());
        e.setPeriodEnd(d.periodEnd());
        e.setPaidAt(d.paidAt());
        return toData(jpa.saveAndFlush(e));
    }

    private static AddonPurchaseData toData(AddonPurchaseEntity e) {
        return new AddonPurchaseData(e.getId(), e.getOrganizationId(), e.getAddonCode(),
                e.getAiCredits(), e.getOcrPages(), e.getAmount(), e.getStatus(),
                e.getBillingType(), e.getInvoiceId(), e.getAsaasPaymentId(), e.getPeriodStart(),
                e.getPeriodEnd(), e.getCreatedAt(), e.getPaidAt());
    }
}
