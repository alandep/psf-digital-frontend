package com.eip.modules.subscription.application;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.subscription.domain.model.Subscription;
import com.eip.modules.subscription.domain.port.out.SubscriptionRepositoryPort;
import com.eip.platform.inbox.InboxService;
import com.eip.platform.outbox.OutboxPublisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Processes Stripe billing webhooks idempotently. Uses the inbox to dedupe
 * external events and drives non-destructive subscription transitions.
 *
 * <p>TODO: a real implementation verifies the Stripe signature (HMAC over the
 * raw body with the endpoint secret) and parses the JSON event body to extract
 * the customer/subscription and derive the organization. Here the parsed
 * fields are passed in by the controller for the mock slice.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StripeWebhookService {

    private static final String SOURCE = "stripe";
    private static final String AGGREGATE_TYPE = "Subscription";

    private final InboxService inbox;
    private final SubscriptionRepositoryPort subscriptionRepo;
    private final OutboxPublisher outbox;

    @Transactional
    public void handle(String eventId, String eventType, String payloadHash,
            UUID organizationId, String stripeSubscriptionId) {
        if (!inbox.receiveOnce(SOURCE, eventId, payloadHash)) {
            log.debug("Webhook Stripe duplicado ignorado eventId={}", eventId);
            return;
        }
        switch (eventType) {
            case "checkout.session.completed", "invoice.paid" ->
                    transition(organizationId, true);
            case "invoice.payment_failed" ->
                    transition(organizationId, false);
            default -> log.info("Evento Stripe ignorado type={}", eventType);
        }
        inbox.markProcessed(SOURCE, eventId);
    }

    private void transition(UUID organizationId, boolean success) {
        if (organizationId == null) {
            log.warn("Webhook Stripe sem organizationId; nada a fazer");
            return;
        }
        Subscription sub = subscriptionRepo.currentForOrg(organizationId).orElse(null);
        if (sub == null) {
            log.warn("Webhook Stripe: nenhuma assinatura para org={}", organizationId);
            return;
        }
        if (success) {
            sub.markActive();
            Subscription saved = subscriptionRepo.save(sub);
            outbox.record(AGGREGATE_TYPE, saved.id().asString(), organizationId,
                    "AssinaturaAtivada", payload(saved));
        } else {
            sub.markPastDue();
            Subscription saved = subscriptionRepo.save(sub);
            outbox.record(AGGREGATE_TYPE, saved.id().asString(), organizationId,
                    "PagamentoFalhou", payload(saved));
        }
    }

    private static String payload(Subscription s) {
        return "{\"subscriptionId\":\"" + s.id().asString()
                + "\",\"status\":\"" + s.status().name() + "\"}";
    }
}
