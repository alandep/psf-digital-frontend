package com.eip.modules.subscription.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.model.BillingRules;
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
                .map(InvoiceJpaAdapter::toData)
                .toList();
    }

    @Override
    public Optional<InvoiceData> byId(UUID id) {
        return jpa.findById(id).map(InvoiceJpaAdapter::toData);
    }

    @Override
    public Optional<InvoiceData> byAsaasPaymentId(String asaasPaymentId) {
        if (asaasPaymentId == null || asaasPaymentId.isBlank()) {
            return Optional.empty();
        }
        return jpa.findByAsaasPaymentId(asaasPaymentId).map(InvoiceJpaAdapter::toData);
    }

    @Override
    public InvoiceData save(InvoiceData d) {
        OffsetDateTime now = OffsetDateTime.now();
        InvoiceEntity e = jpa.findById(d.id()).orElseGet(() -> {
            InvoiceEntity created = new InvoiceEntity();
            created.setId(d.id());
            created.setCreatedAt(now);
            return created;
        });
        e.setOrganizationId(d.organizationId());
        e.setSubscriptionId(d.subscriptionId());
        e.setNumber(d.number());
        e.setPeriod(d.period());
        e.setPlanName(d.planName());
        e.setAmount(d.amount());
        e.setStatus(d.status());
        e.setIssuedAt(d.issuedAt() != null ? d.issuedAt() : now);
        e.setAsaasPaymentId(d.asaasPaymentId());
        e.setKind(d.kind() != null ? d.kind() : BillingRules.KIND_SUBSCRIPTION);
        e.setDescription(d.description());
        e.setDueDate(d.dueDate());
        e.setPaidAt(d.paidAt());
        e.setBillingType(d.billingType());
        e.setInvoiceUrl(d.invoiceUrl());
        e.setBankSlipUrl(d.bankSlipUrl());
        e.setNetValue(d.netValue());
        e.setUpdatedAt(now);
        return toData(jpa.saveAndFlush(e));
    }

    private static InvoiceData toData(InvoiceEntity e) {
        return new InvoiceData(e.getId(), e.getOrganizationId(), e.getSubscriptionId(),
                e.getNumber(), e.getPeriod(), e.getPlanName(), e.getAmount(), e.getStatus(),
                e.getIssuedAt(), e.getAsaasPaymentId(), e.getKind(), e.getDescription(),
                e.getDueDate(), e.getPaidAt(), e.getBillingType(), e.getInvoiceUrl(),
                e.getBankSlipUrl(), e.getNetValue());
    }
}
