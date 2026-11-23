package com.eip.modules.subscription.application;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.subscription.domain.model.BillingRules;
import com.eip.modules.subscription.domain.model.BillingRules.Transition;
import com.eip.modules.subscription.domain.model.Subscription;
import com.eip.modules.subscription.domain.port.out.AddonPurchaseRepositoryPort;
import com.eip.modules.subscription.domain.port.out.AddonPurchaseRepositoryPort.AddonPurchaseData;
import com.eip.modules.subscription.domain.port.out.BillingGatewayRefPort;
import com.eip.modules.subscription.domain.port.out.InvoiceRepositoryPort.InvoiceData;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.GatewayPayment;
import com.eip.modules.subscription.domain.port.out.SubscriptionRepositoryPort;
import com.eip.platform.inbox.InboxService;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.security.AccessPolicyService;
import com.eip.platform.tenant.TenantScope;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Processes Asaas payment webhooks idempotently (inbox) under the owning
 * organization's RLS scope. Event semantics come from
 * {@link BillingRules#transitionFor}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AsaasWebhookService {

    static final String SOURCE = "asaas";
    private static final String AGGREGATE = "Subscription";

    private final InboxService inbox;
    private final BillingGatewayRefPort refs;
    private final SubscriptionRepositoryPort subscriptions;
    private final AddonPurchaseRepositoryPort addons;
    private final InvoiceLedger ledger;
    private final PaymentGatewayPort gateway;
    private final TenantScope tenantScope;
    private final OutboxPublisher outbox;
    private final AccessPolicyService accessPolicy;

    @Transactional
    public void handle(String eventId, String eventType, String payloadHash, GatewayPayment payment) {
        if (!inbox.receiveOnce(SOURCE, eventId, payloadHash)) {
            log.debug("Webhook Asaas duplicado ignorado eventId={}", eventId);
            return;
        }
        if (payment == null || payment.id() == null
                || BillingRules.actionFor(eventType) == BillingRules.WebhookAction.IGNORE) {
            log.info("Webhook Asaas sem efeito eventId={} event={}", eventId, eventType);
            inbox.markProcessed(SOURCE, eventId);
            return;
        }
        Optional<UUID> org = resolveOrganization(payment);
        if (org.isEmpty()) {
            log.warn("Webhook Asaas sem organizacao conhecida eventId={} payment={}", eventId,
                    payment.id());
            inbox.markProcessed(SOURCE, eventId);
            return;
        }
        UUID organizationId = org.get();
        tenantScope.runAs(organizationId, null, () -> apply(organizationId, eventType, payment));
        inbox.markProcessed(SOURCE, eventId);
        accessPolicy.evict(organizationId);
        log.info("Webhook Asaas processado eventId={} event={} payment={} org={}", eventId,
                eventType, payment.id(), organizationId);
    }

    /** externalReference ({@code addon:<uuid>} or org id) -> subscription -> customer. */
    Optional<UUID> resolveOrganization(GatewayPayment p) {
        String ref = p.externalReference();
        if (ref != null && ref.startsWith(BillingRules.ADDON_REF_PREFIX)) {
            Optional<UUID> byAddon = refs.organizationOf(ref);
            if (byAddon.isPresent()) {
                return byAddon;
            }
        } else if (ref != null) {
            try {
                return Optional.of(UUID.fromString(ref.trim()));
            } catch (IllegalArgumentException ignored) {
                // Not an org id: fall through to the gateway references.
            }
        }
        Optional<UUID> bySubscription = refs.organizationOf(p.subscriptionId());
        if (bySubscription.isPresent()) {
            return bySubscription;
        }
        return refs.organizationOf(p.customerId());
    }

    private void apply(UUID org, String eventType, GatewayPayment payment) {
        Subscription sub = subscriptions.currentForOrg(org).orElse(null);
        boolean addon = InvoiceLedger.isAddon(payment);
        String currentStatus = ledger.find(payment).map(InvoiceData::status).orElse(null);
        Transition t = BillingRules.transitionFor(eventType, payment.status(), currentStatus, addon);
        ledger.upsert(org, sub, payment, t.invoiceStatus());
        OffsetDateTime now = OffsetDateTime.now();

        switch (t.subscription()) {
            case START_PAID_PERIOD -> {
                if (sub != null) {
                    startPaidPeriod(org, sub, payment);
                }
            }
            case PAST_DUE -> {
                if (sub != null) {
                    sub.markPastDue();
                    Subscription saved = subscriptions.save(sub);
                    outbox.record(AGGREGATE, saved.id().asString(), org, "PagamentoAtrasado",
                            BillingService.eventPayload(saved));
                }
            }
            case NONE -> { }
        }

        switch (t.addon()) {
            case PAID -> ledger.addonOf(payment)
                    .filter(a -> !"PAID".equals(a.status()))
                    .ifPresent(a -> addons.save(a.paid(now, BillingService.packPeriodEnd(sub, now))));
            case CANCELED -> ledger.addonOf(payment)
                    .filter(a -> !"CANCELED".equals(a.status()))
                    .map(AddonPurchaseData::canceled)
                    .ifPresent(addons::save);
            case NONE -> { }
        }
    }

    private void startPaidPeriod(UUID org, Subscription sub, GatewayPayment payment) {
        LocalDate due = payment.dueDate() != null ? payment.dueDate() : BillingRules.today();
        OffsetDateTime start = BillingRules.startOfDay(due);
        OffsetDateTime end = BillingRules.periodEnd(start, sub.billingInterval());
        boolean newPeriod = sub.startPaidPeriod(start, end);
        if (newPeriod && sub.consumeCouponCycle()) {
            if (sub.gatewayLinked()) {
                gateway.updateSubscription(sub.asaasSubscriptionId(), sub.amount(),
                        BillingService.cycle(sub.billingInterval()), sub.billingType(), true);
            }
            sub.clearCoupon();
            log.info("Cupom encerrado org={}: assinatura volta ao valor cheio", org);
        }
        Subscription saved = subscriptions.save(sub);
        if (newPeriod) {
            outbox.record(AGGREGATE, saved.id().asString(), org, "PagamentoConfirmado",
                    BillingService.eventPayload(saved));
        }
    }
}
