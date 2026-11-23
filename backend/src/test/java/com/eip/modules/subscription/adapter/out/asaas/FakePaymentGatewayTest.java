package com.eip.modules.subscription.adapter.out.asaas;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.CardData;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.CustomerData;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.Cycle;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.GatewayPayment;
import com.eip.modules.subscription.domain.port.out.PaymentGatewayPort.GatewaySubscription;
import com.eip.platform.error.BusinessRuleException;

/** Deterministic behaviour of the in-memory gateway (contract section 6). */
class FakePaymentGatewayTest {

    private final FakePaymentGateway gateway = new FakePaymentGateway();

    private static CardData card(String number) {
        return new CardData("FULANO DE TAL", number, "12", "2030", "123");
    }

    @Test
    void brandFromBin() {
        assertThat(FakePaymentGateway.brandOf("4111111111111111")).isEqualTo("VISA");
        assertThat(FakePaymentGateway.brandOf("5555555555554444")).isEqualTo("MASTERCARD");
        assertThat(FakePaymentGateway.brandOf("378282246310005")).isEqualTo("AMEX");
        assertThat(FakePaymentGateway.brandOf("6362970000457013")).isEqualTo("ELO");
        assertThat(FakePaymentGateway.brandOf("6062825624254001")).isEqualTo("HIPERCARD");
    }

    @Test
    void approvesCardAndDeclinesTestCards() {
        String customer = gateway.upsertCustomer(new CustomerData("Empresa", "11222333000181",
                null, null, null, null, null));
        assertThat(customer).startsWith("cus_fake_");
        GatewaySubscription sub = gateway.createSubscription(customer, new BigDecimal("2490.00"),
                Cycle.MONTHLY, LocalDate.now().plusDays(14), "CREDIT_CARD", "EIP Business",
                "org", card("5555 5555 5555 4444"), null, null, "127.0.0.1");
        assertThat(sub.id()).startsWith("sub_fake_");
        assertThat(sub.cardBrand()).isEqualTo("MASTERCARD");
        assertThat(sub.cardLast4()).isEqualTo("4444");
        assertThat(sub.cardToken()).isNotBlank();

        assertThatThrownBy(() -> gateway.createSubscription(customer, BigDecimal.TEN, Cycle.MONTHLY,
                LocalDate.now(), "CREDIT_CARD", "x", "org", card(FakePaymentGateway.DECLINED_1),
                null, null, "127.0.0.1"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage(FakePaymentGateway.DECLINED_MESSAGE);

        GatewayPayment pay = gateway.createPayment(customer, "CREDIT_CARD", new BigDecimal("390.00"),
                LocalDate.now(), "EIP AI Pack", "addon:x", null, null, sub.cardToken(), "127.0.0.1");
        assertThat(pay.status()).isEqualTo("CONFIRMED");
        GatewayPayment pix = gateway.createPayment(customer, "PIX", new BigDecimal("390.00"),
                LocalDate.now(), "EIP AI Pack", "addon:y", null, null, null, "127.0.0.1");
        assertThat(pix.status()).isEqualTo("PENDING");
        assertThat(gateway.getPixQrCode(pix.id()).payload()).isNotBlank();
    }
}
