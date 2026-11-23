package com.eip.modules.subscription.adapter.out.asaas;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.ResourceNotFoundException;

import lombok.extern.slf4j.Slf4j;

/**
 * In-memory stand-in for Asaas (default when {@code eip.asaas.enabled} is false
 * or missing). Behaviour is deterministic: the test cards
 * {@value #DECLINED_1} and {@value #DECLINED_2} are declined, every other card
 * is approved; the brand comes from the BIN; card payments are CONFIRMED at
 * once, Pix/boleto stay PENDING. Ids use the {@code cus_fake_}, {@code sub_fake_}
 * and {@code pay_fake_} prefixes. State is lost on restart.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "eip.asaas.enabled", havingValue = "false", matchIfMissing = true)
public class FakePaymentGateway implements PaymentGatewayPort {

    static final String DECLINED_1 = "5184019740373151";
    static final String DECLINED_2 = "4916561358240741";
    static final String DECLINED_MESSAGE = "Transação não autorizada. Verifique os dados do cartão.";
    private static final Set<String> DECLINED = Set.of(DECLINED_1, DECLINED_2);

    /** 1x1 PNG used as the fake Pix QR image. */
    static final String FAKE_QR_PNG =
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

    private record Sub(String id, String customerId, BigDecimal value, Cycle cycle,
            String billingType, String externalReference, String description) {
    }

    private record Card(String brand, String last4) {
    }

    private final Map<String, String> customersByDocument = new ConcurrentHashMap<>();
    private final Map<String, Sub> subscriptions = new ConcurrentHashMap<>();
    private final Map<String, GatewayPayment> payments = new ConcurrentHashMap<>();
    private final Map<String, Card> cardsByToken = new ConcurrentHashMap<>();

    @Override
    public String upsertCustomer(CustomerData customer) {
        String doc = digits(customer.cpfCnpj());
        String id = customersByDocument.computeIfAbsent(doc, d -> "cus_fake_" + shortId());
        log.info("[fake-asaas] customer id={}", id);
        return id;
    }

    @Override
    public GatewaySubscription createSubscription(String customerId, BigDecimal value,
            Cycle cycle, LocalDate nextDueDate, String billingType, String description,
            String externalReference, CardData card, HolderData holder, String cardToken,
            String remoteIp) {
        Card c = null;
        String token = null;
        if ("CREDIT_CARD".equals(billingType)) {
            token = cardToken;
            if (card != null) {
                c = authorize(card);
                token = "tok_fake_" + shortId();
                cardsByToken.put(token, c);
            } else if (cardToken != null) {
                c = cardsByToken.get(cardToken);
            } else {
                throw new BusinessRuleException("Informe os dados do cartão de crédito.");
            }
        }
        String id = "sub_fake_" + shortId();
        subscriptions.put(id, new Sub(id, customerId, value, cycle, billingType,
                externalReference, description));
        String paymentId = "pay_fake_" + shortId();
        payments.put(paymentId, new GatewayPayment(paymentId, id, customerId, "PENDING", value,
                value, nextDueDate, null, billingType, invoiceUrl(paymentId),
                "BOLETO".equals(billingType) ? bankSlipUrl(paymentId) : null, null,
                externalReference, description));
        log.info("[fake-asaas] subscription id={} billingType={}", id, billingType);
        return new GatewaySubscription(id, c != null ? c.brand() : null,
                c != null ? c.last4() : null, token);
    }

    @Override
    public void updateSubscription(String subscriptionId, BigDecimal value, Cycle cycle,
            String billingType, boolean updatePendingPayments) {
        Sub s = require(subscriptionId);
        Sub updated = new Sub(s.id(), s.customerId(), value != null ? value : s.value(),
                cycle != null ? cycle : s.cycle(), billingType != null ? billingType : s.billingType(),
                s.externalReference(), s.description());
        subscriptions.put(subscriptionId, updated);
        if (updatePendingPayments) {
            payments.replaceAll((id, p) -> subscriptionId.equals(p.subscriptionId())
                    && "PENDING".equals(p.status())
                    ? new GatewayPayment(p.id(), p.subscriptionId(), p.customerId(), p.status(),
                            updated.value(), updated.value(), p.dueDate(), p.paymentDate(),
                            updated.billingType(), p.invoiceUrl(), p.bankSlipUrl(),
                            p.invoiceNumber(), p.externalReference(), p.description())
                    : p);
        }
    }

    @Override
    public GatewaySubscription updateSubscriptionCard(String subscriptionId, CardData card,
            HolderData holder, String remoteIp) {
        require(subscriptionId);
        Card c = authorize(card);
        String token = "tok_fake_" + shortId();
        cardsByToken.put(token, c);
        return new GatewaySubscription(subscriptionId, c.brand(), c.last4(), token);
    }

    @Override
    public void cancelSubscription(String subscriptionId) {
        subscriptions.remove(subscriptionId);
        payments.entrySet().removeIf(e -> subscriptionId.equals(e.getValue().subscriptionId())
                && "PENDING".equals(e.getValue().status()));
    }

    @Override
    public List<GatewayPayment> listSubscriptionPayments(String subscriptionId) {
        List<GatewayPayment> out = new ArrayList<>();
        for (GatewayPayment p : payments.values()) {
            if (subscriptionId.equals(p.subscriptionId())) {
                out.add(p);
            }
        }
        out.sort(Comparator.comparing(GatewayPayment::dueDate,
                Comparator.nullsLast(Comparator.<LocalDate>reverseOrder())));
        return out;
    }

    @Override
    public GatewayPayment createPayment(String customerId, String billingType, BigDecimal value,
            LocalDate dueDate, String description, String externalReference, CardData card,
            HolderData holder, String cardToken, String remoteIp) {
        String status = "PENDING";
        LocalDate paymentDate = null;
        if ("CREDIT_CARD".equals(billingType)) {
            if (card != null) {
                authorize(card);
            } else if (cardToken == null || cardToken.isBlank()) {
                throw new BusinessRuleException("Informe os dados do cartão de crédito.");
            }
            status = "CONFIRMED";
            paymentDate = dueDate;
        }
        String id = "pay_fake_" + shortId();
        GatewayPayment p = new GatewayPayment(id, null, customerId, status, value, value, dueDate,
                paymentDate, billingType, invoiceUrl(id),
                "BOLETO".equals(billingType) ? bankSlipUrl(id) : null, null, externalReference,
                description);
        payments.put(id, p);
        log.info("[fake-asaas] payment id={} status={}", id, status);
        return p;
    }

    @Override
    public GatewayPayment getPayment(String paymentId) {
        GatewayPayment p = payments.get(paymentId);
        if (p == null) {
            throw new ResourceNotFoundException("Cobrança não encontrada: " + paymentId);
        }
        return p;
    }

    @Override
    public PixQrCode getPixQrCode(String paymentId) {
        return new PixQrCode(FAKE_QR_PNG,
                "00020101021226800014br.gov.bcb.pix2558pix.fake.eip/qr/" + paymentId
                        + "5204000053039865802BR5903EIP6009SAO PAULO62070503***6304ABCD",
                LocalDate.now().plusDays(1) + " 23:59:59");
    }

    // ------------------------------------------------------------------ helpers

    private static Card authorize(CardData card) {
        if (card == null) {
            throw new BusinessRuleException("Informe os dados do cartão de crédito.");
        }
        String number = digits(card.number());
        if (number.length() < 12 || DECLINED.contains(number)) {
            throw new BusinessRuleException(DECLINED_MESSAGE);
        }
        return new Card(brandOf(number), number.substring(number.length() - 4));
    }

    /** Card brand from the BIN (Asaas brand names). */
    static String brandOf(String rawNumber) {
        String n = digits(rawNumber);
        if (n.isEmpty()) {
            return "UNKNOWN";
        }
        if (n.matches("^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67[0-7]\\d"
                + "|9\\d{3})|627780|63(6297|6368)|650(03[1-3]|04\\d|05[0-1]|4[0-3]\\d|48[5-9]|49\\d"
                + "|5[0-2]\\d|53[0-8]|54[1-9]|5[5-8]\\d|59[0-8]|7(0[0-9]|1[0-8]|2[0-7])|9(0[1-9]"
                + "|[1-6]\\d|7[0-8]))|6516(5[2-9]|[6-7]\\d)|6550([0-1]\\d|2[1-9]|[3-4]\\d|5[0-8])).*")) {
            return "ELO";
        }
        if (n.startsWith("606282") || n.startsWith("3841")) {
            return "HIPERCARD";
        }
        if (n.startsWith("34") || n.startsWith("37")) {
            return "AMEX";
        }
        if (n.matches("^3(0[0-5]|[68]).*")) {
            return "DINERS";
        }
        if (n.startsWith("6011") || n.startsWith("65") || n.matches("^64[4-9].*")) {
            return "DISCOVER";
        }
        if (n.matches("^(5[1-5]|2(2[2-9]|[3-6]\\d|7[01]|720)).*")) {
            return "MASTERCARD";
        }
        if (n.startsWith("4")) {
            return "VISA";
        }
        return "UNKNOWN";
    }

    /** Lenient lookup: state is lost on restart, so unknown ids get a placeholder. */
    private Sub require(String subscriptionId) {
        return subscriptions.computeIfAbsent(subscriptionId, id -> new Sub(id, null, null,
                Cycle.MONTHLY, null, null, null));
    }

    private static String invoiceUrl(String paymentId) {
        return "https://sandbox.asaas.com/i/" + paymentId;
    }

    private static String bankSlipUrl(String paymentId) {
        return "https://sandbox.asaas.com/b/pdf/" + paymentId;
    }

    private static String shortId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    private static String digits(String v) {
        return v == null ? "" : v.replaceAll("\\D", "");
    }
}
