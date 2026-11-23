package com.eip.modules.subscription.domain.port.out;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Outbound port to the payment provider (Asaas). Implementations translate
 * provider validation errors (e.g. a declined card) into
 * {@code BusinessRuleException} with the provider message and connectivity /
 * credential / provider-side failures into {@code GatewayUnavailableException}.
 *
 * <p>Card data ({@link CardData}) is only forwarded to the provider: it must
 * never be logged or persisted. Only the provider card token, the brand and the
 * last four digits may be kept.
 */
public interface PaymentGatewayPort {

    /** Billing cycle of a gateway subscription. */
    enum Cycle {
        MONTHLY, YEARLY
    }

    /** Customer registered at the provider. */
    record CustomerData(String name, String cpfCnpj, String email, String phone,
            String postalCode, String addressNumber, String externalReference) {
    }

    /** Raw credit card (never logged/persisted). */
    record CardData(String holderName, String number, String expiryMonth, String expiryYear,
            String ccv) {

        @Override
        public String toString() {
            return "CardData[masked]";
        }
    }

    /** Card holder information required by the provider for card operations. */
    record HolderData(String name, String cpfCnpj, String email, String phone,
            String postalCode, String addressNumber, String addressComplement) {
    }

    /** Result of a subscription create / card update. Card fields may be null. */
    record GatewaySubscription(String id, String cardBrand, String cardLast4, String cardToken) {

        @Override
        public String toString() {
            return "GatewaySubscription[id=" + id + ", brand=" + cardBrand + "]";
        }
    }

    /** A payment (charge) at the provider. */
    record GatewayPayment(String id, String subscriptionId, String customerId, String status,
            BigDecimal value, BigDecimal netValue, LocalDate dueDate, LocalDate paymentDate,
            String billingType, String invoiceUrl, String bankSlipUrl, String invoiceNumber,
            String externalReference, String description) {
    }

    /** Pix QR code of a payment. {@code encodedImage} is a base64 PNG. */
    record PixQrCode(String encodedImage, String payload, String expirationDate) {
    }

    /** Finds the customer by CPF/CNPJ or creates it; returns the provider id. */
    String upsertCustomer(CustomerData customer);

    GatewaySubscription createSubscription(String customerId, BigDecimal value, Cycle cycle,
            LocalDate nextDueDate, String billingType, String description,
            String externalReference, CardData card, HolderData holder, String cardToken,
            String remoteIp);

    void updateSubscription(String subscriptionId, BigDecimal value, Cycle cycle,
            String billingType, boolean updatePendingPayments);

    GatewaySubscription updateSubscriptionCard(String subscriptionId, CardData card,
            HolderData holder, String remoteIp);

    void cancelSubscription(String subscriptionId);

    List<GatewayPayment> listSubscriptionPayments(String subscriptionId);

    GatewayPayment createPayment(String customerId, String billingType, BigDecimal value,
            LocalDate dueDate, String description, String externalReference, CardData card,
            HolderData holder, String cardToken, String remoteIp);

    GatewayPayment getPayment(String paymentId);

    PixQrCode getPixQrCode(String paymentId);
}
