package com.eip.modules.subscription.application;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.admin.TenantSignupApi;
import com.eip.modules.admin.TenantSignupApi.CreatedTenant;
import com.eip.modules.admin.TenantSignupApi.NewTenant;
import com.eip.modules.subscription.application.BillingCommands.AcceptanceInput;
import com.eip.modules.subscription.application.BillingCommands.ActivateCommand;
import com.eip.modules.subscription.application.BillingCommands.AdminInput;
import com.eip.modules.subscription.application.BillingCommands.CancelCommand;
import com.eip.modules.subscription.application.BillingCommands.CardInput;
import com.eip.modules.subscription.application.BillingCommands.ChangePlanCommand;
import com.eip.modules.subscription.application.BillingCommands.CheckoutCommand;
import com.eip.modules.subscription.application.BillingCommands.ClientInfo;
import com.eip.modules.subscription.application.BillingCommands.CompanyInput;
import com.eip.modules.subscription.application.BillingCommands.HolderInput;
import com.eip.modules.subscription.application.BillingCommands.PackPurchaseCommand;
import com.eip.modules.subscription.application.BillingCommands.PaymentInput;
import com.eip.modules.subscription.application.BillingCommands.PlanInput;
import com.eip.modules.subscription.application.BillingViews.CheckoutResult;
import com.eip.modules.subscription.application.BillingViews.CouponInfo;
import com.eip.modules.subscription.application.BillingViews.InvoicePdf;
import com.eip.modules.subscription.application.BillingViews.InvoiceView;
import com.eip.modules.subscription.application.BillingViews.PackPurchaseView;
import com.eip.modules.subscription.application.BillingViews.PackView;
import com.eip.modules.subscription.application.BillingViews.PixView;
import com.eip.modules.subscription.application.BillingViews.SubscriptionView;
import com.eip.modules.subscription.application.BillingViews.UsageView;
import com.eip.modules.subscription.domain.model.BillingInterval;
import com.eip.modules.subscription.domain.model.BillingRules;
import com.eip.modules.subscription.domain.model.Coupon;
import com.eip.modules.subscription.domain.model.PlanCode;
import com.eip.modules.subscription.domain.model.Subscription;
import com.eip.modules.subscription.domain.model.SubscriptionStatus;
import com.eip.modules.subscription.domain.port.out.AddonPurchaseRepositoryPort;
import com.eip.modules.subscription.domain.port.out.AddonPurchaseRepositoryPort.AddonPurchaseData;
import com.eip.modules.subscription.domain.port.out.BillingGatewayRefPort;
import com.eip.modules.subscription.domain.port.out.CheckoutAcceptancePort;
import com.eip.modules.subscription.domain.port.out.CheckoutAcceptancePort.Acceptance;
import com.eip.modules.subscription.domain.port.out.CustomerProfilePort;
import com.eip.modules.subscription.domain.port.out.CustomerProfilePort.CustomerProfile;
import com.eip.modules.subscription.domain.port.out.InvoicePdfPort;
import com.eip.modules.subscription.domain.port.out.InvoicePdfPort.InvoiceDocument;
import com.eip.modules.subscription.domain.port.out.InvoiceRepositoryPort;
import com.eip.modules.subscription.domain.port.out.InvoiceRepositoryPort.InvoiceData;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.CardData;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.CustomerData;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.Cycle;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.GatewayPayment;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.GatewaySubscription;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.HolderData;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.PixQrCode;
import com.eip.modules.subscription.domain.port.out.PlanRepositoryPort.PlanData;
import com.eip.modules.subscription.domain.port.out.SubscriptionRepositoryPort;
import com.eip.platform.billing.UsageQuotaService;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.DomainException;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.outbox.OutboxPublisher;
import com.eip.platform.security.AccessPolicyService;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;
import com.eip.platform.tenant.TenantScope;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Billing use cases backed by the payment gateway (Asaas): public checkout and
 * the logged-in subscription management (activate, plan change, payment method,
 * cancel/reactivate, add-on packs, invoices, Pix and PDF).
 *
 * <p>Ordering rule for flows that create gateway resources: local rows are
 * written/flushed first, then the gateway is called, then the gateway ids are
 * persisted. When anything fails after a gateway subscription was created it is
 * removed again (compensation) and the exception is rethrown so the database
 * transaction rolls back.
 *
 * <p>Card data is only forwarded to the gateway; it is never logged or stored.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BillingService {

    private static final String AGGREGATE = "Subscription";
    private static final Duration SYNC_MAX_AGE = Duration.ofMinutes(5);
    private static final String CREDIT_CARD = "CREDIT_CARD";
    private static final String PIX = "PIX";

    private final SubscriptionRepositoryPort subscriptions;
    private final InvoiceRepositoryPort invoices;
    private final AddonPurchaseRepositoryPort addons;
    private final BillingGatewayRefPort refs;
    private final CheckoutAcceptancePort acceptances;
    private final CustomerProfilePort customers;
    private final PaymentGatewayPort gateway;
    private final InvoicePdfPort pdfRenderer;
    private final PlanCatalogService catalog;
    private final CouponService coupons;
    private final InvoiceLedger ledger;
    private final TenantSignupApi tenants;
    private final TenantScope tenantScope;
    private final UsageQuotaService usageQuota;
    private final AccessPolicyService accessPolicy;
    private final OutboxPublisher outbox;
    private final BillingProperties props;

    // ================================================================== public checkout

    /**
     * Creates the tenant (same as signup), the gateway customer and the gateway
     * subscription (first charge at the end of the trial).
     */
    @Transactional
    public CheckoutResult checkout(CheckoutCommand cmd, ClientInfo client) {
        if (cmd == null) {
            throw new BusinessRuleException("Dados do checkout não informados.");
        }
        AcceptanceInput aceites = requireAcceptance(cmd.aceites());
        CompanyInput empresa = cmd.empresa();
        AdminInput admin = cmd.admin();
        if (empresa == null || admin == null) {
            throw new BusinessRuleException("Informe os dados da empresa e do administrador.");
        }
        PlanInput plano = cmd.plano();
        if (plano == null) {
            throw new BusinessRuleException("Selecione um plano.");
        }
        PlanData plan = catalog.contractablePlan(plano.planCode());
        BillingInterval interval = BillingRules.parseInterval(plano.interval());
        BigDecimal amount = PlanCatalogService.price(plan, interval);
        PaymentInput payment = requirePayment(cmd.pagamento());
        Coupon coupon = coupons.requireValid(plano.coupon(), plan.code(), interval);

        CreatedTenant tenant = tenants.createTenant(new NewTenant(admin.nome(), admin.cpf(),
                admin.email(), admin.telefone(), admin.senha(), empresa.cnpj(),
                empresa.razaoSocial(), empresa.nomeFantasia(), empresa.segmento(),
                empresa.email(), empresa.telefone(), plan.code(), plan.name(), interval.name(),
                amount, props.trialDays()));
        UUID org = tenant.organizationId();
        UUID userId = tenant.userId();
        if (coupon != null) {
            coupons.redeem(coupon);
        }

        LocalDate nextDue = tenant.trialEnd().atZoneSameInstant(BillingRules.ZONE).toLocalDate();
        BigDecimal charge = coupon != null ? coupon.fixedPrice() : amount;
        HolderInput holder = payment.titular();
        CustomerData customer = new CustomerData(empresa.razaoSocial(), empresa.cnpj(),
                firstNonBlank(empresa.email(), admin.email()),
                firstNonBlank(empresa.telefone(), admin.telefone()),
                holder != null ? holder.cep() : null, holder != null ? holder.numero() : null,
                org.toString());
        String customerId = gateway.upsertCustomer(customer);
        GatewaySubscription gs = gateway.createSubscription(customerId, charge, cycle(interval),
                nextDue, payment.metodo(), description(plan, interval), org.toString(),
                card(payment), holder(payment), null, client.ip());
        OffsetDateTime now = OffsetDateTime.now();
        try {
            tenantScope.runAs(org, userId, () -> {
                Subscription sub = load(org);
                sub.linkGateway(customerId, gs.id(), payment.metodo(), gs.cardToken(),
                        gs.cardBrand(), gs.cardLast4(), nextDue);
                if (coupon != null) {
                    sub.applyCoupon(coupon.code(), coupon.fixedPrice(), coupon.cycles());
                }
                Subscription saved = subscriptions.save(sub);
                refs.register(customerId, BillingGatewayRefPort.KIND_CUSTOMER, org);
                refs.register(gs.id(), BillingGatewayRefPort.KIND_SUBSCRIPTION, org);
                acceptances.record(new Acceptance(UUID.randomUUID(), org, userId,
                        aceites.termsVersion(), aceites.privacyVersion(), true, client.ip(),
                        client.userAgent(), now));
                outbox.record(AGGREGATE, saved.id().asString(), org, "AssinaturaContratada",
                        eventPayload(saved));
            });
        } catch (RuntimeException ex) {
            compensate(gs.id());
            throw ex;
        }
        accessPolicy.evict(org);
        log.info("Checkout concluido org={} plano={} intervalo={} metodo={}", org, plan.code(),
                interval, payment.metodo());
        return new CheckoutResult(org, userId, plan.code(), interval.name(), charge,
                tenant.trialEnd(), nextDue, payment.metodo(), gs.cardBrand(), gs.cardLast4());
    }

    // ================================================================== reads

    @Transactional(readOnly = true)
    public SubscriptionView current() {
        return toView(load(currentOrg()));
    }

    public UsageView usage() {
        UsageQuotaService.UsageSnapshot s = usageQuota.snapshot(currentOrg());
        return new UsageView(s.periodStart(), s.periodEnd(), List.of(s.ai(), s.ocr(), s.storage()));
    }

    public List<UsageQuotaService.UsageEntry> usageStatement(String feature, Integer limit) {
        String f = feature == null ? "AI" : feature.trim().toUpperCase(Locale.ROOT);
        if (!"AI".equals(f) && !"OCR".equals(f)) {
            throw new BusinessRuleException("Recurso inválido. Use AI ou OCR.");
        }
        int l = limit == null ? 200 : Math.max(1, Math.min(500, limit));
        return usageQuota.statement(currentOrg(), f, l);
    }

    /** Lists invoices, syncing with the gateway when the last sync is older than 5 minutes. */
    @Transactional
    public List<InvoiceView> invoices() {
        UUID org = currentOrg();
        Subscription sub = subscriptions.currentForOrg(org).orElse(null);
        OffsetDateTime now = OffsetDateTime.now();
        if (sub != null && sub.invoicesSyncDue(now, SYNC_MAX_AGE)) {
            try {
                for (GatewayPayment p : gateway.listSubscriptionPayments(sub.asaasSubscriptionId())) {
                    ledger.upsert(org, sub, p, null);
                }
                sub.markInvoicesSynced(now);
                subscriptions.save(sub);
            } catch (DomainException ex) {
                // Gateway down / rejected: serve the local copy.
                log.warn("Sincronizacao de faturas falhou org={} code={}", org, ex.getCode());
            }
        }
        return invoices.forOrg(org).stream().map(BillingService::toInvoiceView).toList();
    }

    @Transactional(readOnly = true)
    public PixView invoicePix(UUID invoiceId) {
        InvoiceData inv = loadInvoice(invoiceId);
        if (!isOpenPix(inv)) {
            throw new BusinessRuleException("Esta fatura não possui Pix disponível para pagamento.");
        }
        PixQrCode qr = gateway.getPixQrCode(inv.asaasPaymentId());
        return new PixView(qr.encodedImage(), qr.payload(), qr.expirationDate());
    }

    @Transactional(readOnly = true)
    public InvoicePdf invoicePdf(UUID invoiceId) {
        UUID org = currentOrg();
        InvoiceData inv = loadInvoice(invoiceId);
        CustomerProfile profile = customers.forOrg(org)
                .orElse(new CustomerProfile(null, null, null, null));
        PixQrCode pix = null;
        if (isOpenPix(inv)) {
            try {
                pix = gateway.getPixQrCode(inv.asaasPaymentId());
            } catch (DomainException ex) {
                log.warn("Pix indisponivel para o PDF invoice={} code={}", inv.id(), ex.getCode());
            }
        }
        BillingProperties.Issuer issuer = props.issuer();
        byte[] content = pdfRenderer.render(new InvoiceDocument(issuer.name(), issuer.cnpj(),
                issuer.address(), issuer.email(), profile.razaoSocial(), profile.cnpj(),
                profile.email(), inv.number(), inv.issuedAt(), inv.dueDate(), inv.paidAt(),
                inv.status(), inv.billingType(),
                inv.description() != null ? inv.description() : inv.planName(), inv.period(),
                inv.amount(), inv.invoiceUrl(), inv.bankSlipUrl(),
                pix != null ? pix.encodedImage() : null, pix != null ? pix.payload() : null,
                OffsetDateTime.now()));
        String safeNumber = inv.number() == null ? inv.id().toString()
                : inv.number().replaceAll("[^A-Za-z0-9_-]", "_");
        return new InvoicePdf("fatura-" + safeNumber + ".pdf", content);
    }

    // ================================================================== subscription changes

    /** Links an org without gateway subscription (e.g. trial or admin-created) to the gateway. */
    @Transactional
    public SubscriptionView activate(ActivateCommand cmd, ClientInfo client) {
        if (cmd == null) {
            throw new BusinessRuleException("Dados de ativação não informados.");
        }
        UUID org = currentOrg();
        Subscription sub = load(org);
        if (sub.gatewayLinked()) {
            throw new BusinessRuleException("Esta assinatura já possui cobrança ativa.");
        }
        if (sub.status() == SubscriptionStatus.CANCELED
                || sub.status() == SubscriptionStatus.TERMINATED) {
            throw new BusinessRuleException(
                    "Assinatura cancelada: use a opção de reativar ou fale com nosso time.");
        }
        PlanData plan = catalog.contractablePlan(cmd.planCode());
        BillingInterval interval = BillingRules.parseInterval(cmd.interval());
        BigDecimal amount = PlanCatalogService.price(plan, interval);
        PaymentInput payment = requirePayment(cmd.pagamento());
        Coupon coupon = coupons.requireValid(cmd.coupon(), plan.code(), interval);
        CustomerProfile profile = requireProfile(org);
        if (coupon != null) {
            coupons.redeem(coupon);
        }
        boolean planChanged = sub.planCode() != PlanCode.valueOf(plan.code());
        sub.changePlan(PlanCode.valueOf(plan.code()), plan.name(), interval, amount);
        if (coupon != null) {
            sub.applyCoupon(coupon.code(), coupon.fixedPrice(), coupon.cycles());
        } else {
            sub.clearCoupon();
        }
        subscriptions.save(sub);

        LocalDate today = BillingRules.today();
        LocalDate trialDate = sub.trialEnd() != null
                ? sub.trialEnd().atZoneSameInstant(BillingRules.ZONE).toLocalDate() : today;
        LocalDate nextDue = trialDate.isAfter(today) ? trialDate : today;
        String customerId = sub.asaasCustomerId() != null ? sub.asaasCustomerId()
                : gateway.upsertCustomer(customerData(profile, payment.titular(), org));
        GatewaySubscription gs = gateway.createSubscription(customerId, sub.chargeAmount(),
                cycle(interval), nextDue, payment.metodo(), description(plan, interval),
                org.toString(), card(payment), holder(payment), null, client.ip());
        try {
            sub = load(org);
            sub.linkGateway(customerId, gs.id(), payment.metodo(), gs.cardToken(), gs.cardBrand(),
                    gs.cardLast4(), nextDue);
            Subscription saved = subscriptions.save(sub);
            refs.register(customerId, BillingGatewayRefPort.KIND_CUSTOMER, org);
            refs.register(gs.id(), BillingGatewayRefPort.KIND_SUBSCRIPTION, org);
            if (planChanged) {
                tenants.applyPlanEntitlements(org, plan.code());
            }
            outbox.record(AGGREGATE, saved.id().asString(), org, "AssinaturaAtivada",
                    eventPayload(saved));
            accessPolicy.evict(org);
            return toView(saved);
        } catch (RuntimeException ex) {
            compensate(gs.id());
            throw ex;
        }
    }

    /** Changes plan/interval; the new price applies from the next charge. */
    @Transactional
    public SubscriptionView changePlan(ChangePlanCommand cmd) {
        if (cmd == null) {
            throw new BusinessRuleException("Selecione um plano.");
        }
        UUID org = currentOrg();
        Subscription sub = load(org);
        PlanData plan = catalog.contractablePlan(cmd.planCode());
        BillingInterval interval = cmd.interval() == null || cmd.interval().isBlank()
                ? sub.billingInterval() : BillingRules.parseInterval(cmd.interval());
        PlanCode code = PlanCode.valueOf(plan.code());
        if (code == sub.planCode() && interval == sub.billingInterval()) {
            return toView(sub);
        }
        sub.changePlan(code, plan.name(), interval, PlanCatalogService.price(plan, interval));
        // Coupons are bound to a plan/interval: any change returns to the full price.
        sub.clearCoupon();
        Subscription saved = subscriptions.save(sub);
        tenants.applyPlanEntitlements(org, plan.code());
        if (saved.gatewayLinked()) {
            gateway.updateSubscription(saved.asaasSubscriptionId(), saved.chargeAmount(),
                    cycle(interval), saved.billingType(), true);
        }
        outbox.record(AGGREGATE, saved.id().asString(), org, "PlanoAlterado", eventPayload(saved));
        accessPolicy.evict(org);
        return toView(saved);
    }

    @Transactional
    public SubscriptionView changePaymentMethod(PaymentInput input, ClientInfo client) {
        UUID org = currentOrg();
        Subscription sub = load(org);
        if (!sub.gatewayLinked()) {
            throw new BusinessRuleException(
                    "Ative a assinatura antes de alterar a forma de pagamento.");
        }
        PaymentInput payment = requirePayment(input);
        String gatewayId = sub.asaasSubscriptionId();
        if (CREDIT_CARD.equals(payment.metodo())) {
            if (!CREDIT_CARD.equals(sub.billingType())) {
                gateway.updateSubscription(gatewayId, null, null, CREDIT_CARD, true);
            }
            GatewaySubscription gs = gateway.updateSubscriptionCard(gatewayId, card(payment),
                    holder(payment), client.ip());
            sub.updatePaymentMethod(CREDIT_CARD, gs.cardToken(), gs.cardBrand(), gs.cardLast4());
        } else {
            gateway.updateSubscription(gatewayId, null, null, payment.metodo(), true);
            sub.updatePaymentMethod(payment.metodo(), null, null, null);
        }
        Subscription saved = subscriptions.save(sub);
        outbox.record(AGGREGATE, saved.id().asString(), org, "FormaPagamentoAlterada",
                eventPayload(saved));
        accessPolicy.evict(org);
        return toView(saved);
    }

    @Transactional
    public SubscriptionView cancel(CancelCommand cmd) {
        if (cmd == null || cmd.reason() == null || cmd.reason().isBlank()) {
            throw new BusinessRuleException("Informe o motivo do cancelamento.");
        }
        UUID org = currentOrg();
        Subscription sub = load(org);
        String gatewayId = sub.asaasSubscriptionId();
        String reason = cmd.reason().trim()
                + (cmd.comment() != null && !cmd.comment().isBlank() ? " - " + cmd.comment().trim() : "");
        if (reason.length() > 1000) {
            reason = reason.substring(0, 1000);
        }
        sub.cancel(reason, OffsetDateTime.now());
        Subscription saved = subscriptions.save(sub);
        outbox.record(AGGREGATE, saved.id().asString(), org, "AssinaturaCancelada",
                "{\"subscriptionId\":\"" + saved.id().asString() + "\",\"status\":\""
                        + saved.status().name() + "\",\"reason\":\"" + jsonEscape(cmd.reason().trim())
                        + "\"}");
        if (gatewayId != null) {
            gateway.cancelSubscription(gatewayId);
        }
        accessPolicy.evict(org);
        return toView(saved);
    }

    /** Recreates the gateway subscription of a canceled org (next charge at period end). */
    @Transactional
    public SubscriptionView reactivate(ClientInfo client) {
        UUID org = currentOrg();
        Subscription sub = load(org);
        OffsetDateTime now = OffsetDateTime.now();
        if (!sub.canReactivate(now)) {
            throw new BusinessRuleException(
                    "Só é possível reativar uma assinatura cancelada dentro do período vigente.");
        }
        String billingType = sub.billingType();
        boolean card = CREDIT_CARD.equals(billingType);
        if (sub.asaasCustomerId() == null || billingType == null || (card && sub.cardToken() == null)) {
            throw new BusinessRuleException("Não há forma de pagamento cadastrada. "
                    + "Ative a assinatura informando a forma de pagamento.");
        }
        LocalDate today = BillingRules.today();
        LocalDate periodEnd = sub.currentPeriodEnd().atZoneSameInstant(BillingRules.ZONE).toLocalDate();
        LocalDate nextDue = periodEnd.isAfter(today) ? periodEnd : today;
        GatewaySubscription gs = gateway.createSubscription(sub.asaasCustomerId(),
                sub.chargeAmount(), cycle(sub.billingInterval()), nextDue, billingType,
                sub.planName() + " - " + intervalLabel(sub.billingInterval()), org.toString(),
                null, null, card ? sub.cardToken() : null, client.ip());
        try {
            sub.reactivate(gs.id(), nextDue, now);
            Subscription saved = subscriptions.save(sub);
            refs.register(gs.id(), BillingGatewayRefPort.KIND_SUBSCRIPTION, org);
            outbox.record(AGGREGATE, saved.id().asString(), org, "AssinaturaReativada",
                    eventPayload(saved));
            accessPolicy.evict(org);
            return toView(saved);
        } catch (RuntimeException ex) {
            compensate(gs.id());
            throw ex;
        }
    }

    // ================================================================== add-on packs

    @Transactional
    public PackPurchaseView purchasePack(PackPurchaseCommand cmd, ClientInfo client) {
        if (cmd == null) {
            throw new BusinessRuleException("Selecione um pacote.");
        }
        PackView pack = catalog.pack(cmd.addonCode())
                .orElseThrow(() -> new BusinessRuleException("Pacote não encontrado."));
        String metodo = normalizeMethod(cmd.metodo());
        UUID org = currentOrg();
        Subscription sub = load(org);
        if (sub.status() == SubscriptionStatus.TERMINATED) {
            throw new BusinessRuleException("Assinatura encerrada: não é possível comprar pacotes.");
        }
        boolean useSaved = CREDIT_CARD.equals(metodo) && Boolean.TRUE.equals(cmd.usarCartaoSalvo());
        PaymentInput payment = new PaymentInput(metodo, cmd.cartao(), cmd.titular());
        if (useSaved && sub.cardToken() == null) {
            throw new BusinessRuleException("Nenhum cartão salvo. Informe os dados do cartão.");
        }
        if (CREDIT_CARD.equals(metodo) && !useSaved) {
            payment = requirePayment(payment);
        }

        String customerId = sub.asaasCustomerId();
        if (customerId == null) {
            customerId = gateway.upsertCustomer(customerData(requireProfile(org), cmd.titular(), org));
            sub.linkCustomer(customerId);
            sub = subscriptions.save(sub);
            refs.register(customerId, BillingGatewayRefPort.KIND_CUSTOMER, org);
        }

        OffsetDateTime now = OffsetDateTime.now();
        LocalDate today = BillingRules.today();
        UUID purchaseId = UUID.randomUUID();
        UUID invoiceId = UUID.randomUUID();
        InvoiceData invoice = invoices.save(new InvoiceData(invoiceId, org, sub.id().value(),
                BillingRules.invoiceNumber(null, purchaseId.toString(), today),
                BillingRules.period(today), pack.name(), pack.amount(), BillingRules.INVOICE_OPEN,
                now, null, BillingRules.KIND_ADDON, pack.name(), today, null, metodo, null, null,
                null));
        AddonPurchaseData purchase = addons.save(new AddonPurchaseData(purchaseId, org,
                pack.code(), pack.aiCredits(), pack.ocrPages(), pack.amount(), "PENDING", metodo,
                invoiceId, null, null, null, now, null));
        String externalReference = BillingRules.ADDON_REF_PREFIX + purchaseId;
        refs.register(externalReference, BillingGatewayRefPort.KIND_ADDON, org);

        GatewayPayment paid = gateway.createPayment(customerId, metodo, pack.amount(), today,
                pack.name(), externalReference, useSaved ? null : card(payment),
                useSaved ? null : holder(payment), useSaved ? sub.cardToken() : null, client.ip());
        invoice = invoice.withGateway(paid.id(),
                BillingRules.invoiceNumber(paid.invoiceNumber(), paid.id(), today),
                paid.invoiceUrl(), paid.bankSlipUrl());
        purchase = purchase.withPayment(invoiceId, paid.id());
        boolean settled = BillingRules.isPaidStatus(paid.status());
        if (settled) {
            invoice = invoice.withStatus(BillingRules.INVOICE_PAID, now);
            purchase = purchase.paid(now, packPeriodEnd(sub, now));
        }
        invoices.save(invoice);
        purchase = addons.save(purchase);

        PixView pix = null;
        if (PIX.equals(metodo) && !settled) {
            try {
                PixQrCode qr = gateway.getPixQrCode(paid.id());
                pix = new PixView(qr.encodedImage(), qr.payload(), qr.expirationDate());
            } catch (DomainException ex) {
                log.warn("QR Pix indisponivel payment={} code={}", paid.id(), ex.getCode());
            }
        }
        outbox.record(AGGREGATE, sub.id().asString(), org, "PacoteComprado",
                "{\"purchaseId\":\"" + purchaseId + "\",\"addonCode\":\"" + pack.code()
                        + "\",\"status\":\"" + purchase.status() + "\"}");
        accessPolicy.evict(org);
        log.info("Pacote comprado org={} purchase={} payment={} status={}", org, purchaseId,
                paid.id(), purchase.status());
        return new PackPurchaseView(purchaseId, purchase.status(), invoiceId, paid.invoiceUrl(),
                paid.bankSlipUrl(), pix);
    }

    /** Packs last until the end of the current billing cycle. */
    static OffsetDateTime packPeriodEnd(Subscription sub, OffsetDateTime now) {
        OffsetDateTime end = sub != null ? sub.currentPeriodEnd() : null;
        return end != null && end.isAfter(now) ? end : now.plusMonths(1);
    }

    // ================================================================== helpers

    private void compensate(String gatewaySubscriptionId) {
        try {
            gateway.cancelSubscription(gatewaySubscriptionId);
            log.warn("Compensacao: assinatura removida no gateway id={}", gatewaySubscriptionId);
        } catch (RuntimeException ex) {
            log.error("Compensacao falhou: remover manualmente a assinatura id={} no gateway",
                    gatewaySubscriptionId);
        }
    }

    private static UUID currentOrg() {
        OrganizationContext ctx = OrganizationContextHolder.currentOrNull();
        if (ctx == null) {
            throw new BusinessRuleException("Sessão sem organização ativa.");
        }
        return ctx.organizationId().value();
    }

    private Subscription load(UUID org) {
        return subscriptions.currentForOrg(org)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nenhuma assinatura encontrada para a organização."));
    }

    private InvoiceData loadInvoice(UUID invoiceId) {
        UUID org = currentOrg();
        return invoices.byId(invoiceId)
                .filter(i -> org.equals(i.organizationId()))
                .orElseThrow(() -> new ResourceNotFoundException("Fatura não encontrada."));
    }

    private CustomerProfile requireProfile(UUID org) {
        CustomerProfile p = customers.forOrg(org).orElse(null);
        if (p == null || isBlank(p.razaoSocial()) || isBlank(p.cnpj())) {
            throw new BusinessRuleException(
                    "Complete os dados da empresa (razão social e CNPJ) antes de contratar.");
        }
        return p;
    }

    private static CustomerData customerData(CustomerProfile p, HolderInput holder, UUID org) {
        return new CustomerData(p.razaoSocial(), p.cnpj(), p.email(), p.phone(),
                holder != null ? holder.cep() : null, holder != null ? holder.numero() : null,
                org.toString());
    }

    private static boolean isOpenPix(InvoiceData inv) {
        return PIX.equals(inv.billingType()) && inv.asaasPaymentId() != null
                && (BillingRules.INVOICE_OPEN.equals(inv.status())
                        || BillingRules.INVOICE_OVERDUE.equals(inv.status()));
    }

    private static AcceptanceInput requireAcceptance(AcceptanceInput a) {
        if (a == null || !Boolean.TRUE.equals(a.termos()) || !Boolean.TRUE.equals(a.privacidade())
                || !Boolean.TRUE.equals(a.cobranca())) {
            throw new BusinessRuleException("É necessário aceitar os termos de uso, a política de "
                    + "privacidade e a autorização de cobrança.");
        }
        if (isBlank(a.termsVersion()) || isBlank(a.privacyVersion())) {
            throw new BusinessRuleException("Versão dos termos aceitos não informada.");
        }
        return a;
    }

    /** Validates the payment method and, for cards, the card + holder fields. */
    static PaymentInput requirePayment(PaymentInput p) {
        if (p == null) {
            throw new BusinessRuleException("Informe a forma de pagamento.");
        }
        String metodo = normalizeMethod(p.metodo());
        if (!CREDIT_CARD.equals(metodo)) {
            return new PaymentInput(metodo, null, p.titular());
        }
        CardInput c = p.cartao();
        if (c == null || isBlank(c.holderName()) || isBlank(c.number()) || isBlank(c.expiryMonth())
                || isBlank(c.expiryYear()) || isBlank(c.ccv())) {
            throw new BusinessRuleException("Informe os dados do cartão de crédito.");
        }
        HolderInput h = p.titular();
        if (h == null || isBlank(h.nome()) || isBlank(h.cpfCnpj()) || isBlank(h.email())
                || isBlank(h.telefone()) || isBlank(h.cep()) || isBlank(h.numero())) {
            throw new BusinessRuleException("Informe os dados do titular do cartão "
                    + "(nome, CPF/CNPJ, e-mail, telefone, CEP e número).");
        }
        return new PaymentInput(metodo, c, h);
    }

    private static String normalizeMethod(String metodo) {
        String m = metodo == null ? "" : metodo.trim().toUpperCase(Locale.ROOT);
        if (!BillingRules.BILLING_TYPES.contains(m)) {
            throw new BusinessRuleException("Forma de pagamento inválida. Use CREDIT_CARD, PIX ou BOLETO.");
        }
        return m;
    }

    private static CardData card(PaymentInput p) {
        CardInput c = p.cartao();
        if (!CREDIT_CARD.equals(p.metodo()) || c == null) {
            return null;
        }
        return new CardData(c.holderName().trim(), c.number().replaceAll("\\D", ""),
                c.expiryMonth().trim(), c.expiryYear().trim(), c.ccv().trim());
    }

    private static HolderData holder(PaymentInput p) {
        HolderInput h = p.titular();
        if (!CREDIT_CARD.equals(p.metodo()) || h == null) {
            return null;
        }
        return new HolderData(h.nome(), h.cpfCnpj(), h.email(), h.telefone(), h.cep(), h.numero(),
                h.complemento());
    }

    static Cycle cycle(BillingInterval interval) {
        return interval == BillingInterval.ANNUAL ? Cycle.YEARLY : Cycle.MONTHLY;
    }

    private static String description(PlanData plan, BillingInterval interval) {
        return plan.name() + " - " + intervalLabel(interval);
    }

    private static String intervalLabel(BillingInterval interval) {
        return interval == BillingInterval.ANNUAL ? "assinatura anual" : "assinatura mensal";
    }

    static SubscriptionView toView(Subscription s) {
        CouponInfo coupon = s.hasCoupon()
                ? new CouponInfo(s.couponCode(), s.couponPrice(), s.couponCyclesRemaining()) : null;
        return new SubscriptionView(
                s.id().value(),
                s.planCode().name(),
                s.planName(),
                s.billingInterval() != null ? s.billingInterval().name() : null,
                s.amount(),
                s.status().name(),
                s.currentPeriodStart(),
                s.currentPeriodEnd(),
                s.trialEnd(),
                s.nextDueDate(),
                s.cancelAtPeriodEnd(),
                s.canceledAt(),
                s.billingType(),
                s.paymentBrand(),
                s.paymentLast4(),
                s.gatewayLinked(),
                coupon,
                s.licenseMode().name());
    }

    private static InvoiceView toInvoiceView(InvoiceData i) {
        return new InvoiceView(i.id(), i.number(), i.kind(), i.description(), i.period(),
                i.planName(), i.amount(), i.status(), i.issuedAt(), i.dueDate(), i.paidAt(),
                i.billingType(), i.invoiceUrl(), i.bankSlipUrl());
    }

    static String eventPayload(Subscription s) {
        return "{\"subscriptionId\":\"" + s.id().asString()
                + "\",\"planCode\":\"" + s.planCode().name()
                + "\",\"status\":\"" + s.status().name() + "\"}";
    }

    private static String jsonEscape(String v) {
        return v.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", " ");
    }

    private static String firstNonBlank(String a, String b) {
        return isBlank(a) ? b : a;
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
