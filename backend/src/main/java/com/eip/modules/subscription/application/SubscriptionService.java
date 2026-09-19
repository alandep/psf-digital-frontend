package com.eip.modules.subscription.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.subscription.domain.model.BillingInterval;
import com.eip.modules.subscription.domain.model.PlanCode;
import com.eip.modules.subscription.domain.model.Subscription;
import com.eip.modules.subscription.domain.model.SubscriptionId;
import com.eip.modules.subscription.domain.model.SubscriptionStatus;
import com.eip.modules.subscription.domain.port.in.CheckoutUseCase;
import com.eip.modules.subscription.domain.port.in.ManageSubscriptionUseCase;
import com.eip.modules.subscription.domain.port.out.InvoiceRepositoryPort;
import com.eip.modules.subscription.domain.port.out.PlanRepositoryPort;
import com.eip.modules.subscription.domain.port.out.PlanRepositoryPort.PlanData;
import com.eip.modules.subscription.domain.port.out.SubscriptionRepositoryPort;
import com.eip.modules.subscription.domain.port.out.UsageRepositoryPort;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service implementing the organization billing use cases. Loads
 * the tenant subscription from the {@link OrganizationContextHolder}, applies
 * domain transitions and records outbox events within the same transaction.
 */
@Service
@RequiredArgsConstructor
public class SubscriptionService implements ManageSubscriptionUseCase, CheckoutUseCase {

    private static final String AGGREGATE_TYPE = "Subscription";

    private final SubscriptionRepositoryPort subscriptionRepo;
    private final PlanRepositoryPort planRepo;
    private final UsageRepositoryPort usageRepo;
    private final InvoiceRepositoryPort invoiceRepo;
    private final OutboxPublisher outbox;

    private static UUID currentOrg() {
        return OrganizationContextHolder.current().organizationId().value();
    }

    private Subscription loadCurrent(UUID org) {
        return subscriptionRepo.currentForOrg(org)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nenhuma assinatura para a organizacao " + org));
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionView current() {
        return toView(loadCurrent(currentOrg()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlanView> plans() {
        return planRepo.activePlans().stream()
                .map(p -> new PlanView(p.code(), p.name(), p.description(),
                        p.monthlyPrice(), p.annualPrice(), p.highlighted()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsageView> usage() {
        return usageRepo.forOrg(currentOrg()).stream()
                .map(u -> new UsageView(u.feature(), u.label(), u.used(),
                        u.included(), u.unit(), percent(u.used(), u.included())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceView> invoices() {
        return invoiceRepo.forOrg(currentOrg()).stream()
                .map(i -> new InvoiceView(i.id(), i.number(), i.period(),
                        i.planName(), i.amount(), i.status(), i.issuedAt()))
                .toList();
    }

    @Override
    @Transactional
    public SubscriptionView changePlan(String planCode) {
        UUID org = currentOrg();
        Subscription sub = loadCurrent(org);
        PlanData plan = planRepo.byCode(planCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Plano nao encontrado: " + planCode));
        sub.changePlan(PlanCode.valueOf(plan.code()), plan.name(), plan.monthlyPrice());
        Subscription saved = subscriptionRepo.save(sub);
        outbox.record(AGGREGATE_TYPE, saved.id().asString(), org, "PlanoAlterado",
                eventPayload(saved));
        return toView(saved);
    }

    @Override
    @Transactional
    public SubscriptionView cancel(String reason) {
        UUID org = currentOrg();
        Subscription sub = loadCurrent(org);
        sub.cancel();
        Subscription saved = subscriptionRepo.save(sub);
        outbox.record(AGGREGATE_TYPE, saved.id().asString(), org, "AssinaturaCancelada",
                cancelPayload(saved, reason));
        return toView(saved);
    }

    @Override
    @Transactional
    public SubscriptionView reactivate() {
        UUID org = currentOrg();
        Subscription sub = loadCurrent(org);
        sub.reactivate();
        Subscription saved = subscriptionRepo.save(sub);
        outbox.record(AGGREGATE_TYPE, saved.id().asString(), org, "AssinaturaReativada",
                eventPayload(saved));
        return toView(saved);
    }

    @Override
    @Transactional
    public CheckoutView startCheckout(String planCode, String interval) {
        UUID org = currentOrg();
        PlanData plan = planRepo.byCode(planCode)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Plano nao encontrado: " + planCode));
        BillingInterval billing = "ANNUAL".equalsIgnoreCase(interval)
                ? BillingInterval.ANNUAL : BillingInterval.MONTHLY;
        BigDecimal amount = billing == BillingInterval.ANNUAL
                ? plan.annualPrice() : plan.monthlyPrice();

        Subscription sub = subscriptionRepo.currentForOrg(org).orElse(null);
        if (sub == null) {
            OffsetDateTime now = OffsetDateTime.now();
            sub = new Subscription(SubscriptionId.newId(), org,
                    PlanCode.valueOf(plan.code()), plan.name(), billing, amount,
                    SubscriptionStatus.TRIALING, now, now.plusDays(14),
                    now.plusDays(14), false, null, null, 0L);
        } else {
            sub.changePlan(PlanCode.valueOf(plan.code()), plan.name(), amount);
            sub.startTrial(OffsetDateTime.now().plusDays(14));
        }
        Subscription saved = subscriptionRepo.save(sub);
        outbox.record(AGGREGATE_TYPE, saved.id().asString(), org, "CheckoutIniciado",
                eventPayload(saved));
        String url = "https://checkout.stripe.mock/session/" + UUID.randomUUID();
        return new CheckoutView(url, saved.status().name());
    }

    private static int percent(BigDecimal used, BigDecimal included) {
        if (included == null || included.signum() <= 0 || used == null) {
            return 0;
        }
        int pct = used.multiply(BigDecimal.valueOf(100))
                .divide(included, 0, RoundingMode.HALF_UP)
                .intValue();
        return Math.min(100, Math.max(0, pct));
    }

    private static SubscriptionView toView(Subscription s) {
        return new SubscriptionView(
                s.id().value(),
                s.planCode().name(),
                s.planName(),
                s.billingInterval() != null ? s.billingInterval().name() : null,
                s.amount(),
                s.status().name(),
                s.currentPeriodEnd(),
                s.paymentBrand(),
                s.paymentLast4(),
                s.licenseMode().name());
    }

    private static String eventPayload(Subscription s) {
        return "{\"subscriptionId\":\"" + s.id().asString()
                + "\",\"planCode\":\"" + s.planCode().name()
                + "\",\"status\":\"" + s.status().name() + "\"}";
    }

    private static String cancelPayload(Subscription s, String reason) {
        String safeReason = reason == null ? "" : reason.replace("\"", "'");
        return "{\"subscriptionId\":\"" + s.id().asString()
                + "\",\"status\":\"" + s.status().name()
                + "\",\"reason\":\"" + safeReason + "\"}";
    }
}
