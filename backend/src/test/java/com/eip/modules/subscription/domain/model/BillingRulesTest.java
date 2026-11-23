package com.eip.modules.subscription.domain.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.Test;

import com.eip.modules.subscription.domain.model.BillingRules.AddonEffect;
import com.eip.modules.subscription.domain.model.BillingRules.SubscriptionEffect;
import com.eip.modules.subscription.domain.model.BillingRules.Transition;
import com.eip.modules.subscription.domain.model.BillingRules.WebhookAction;
import com.eip.platform.error.BusinessRuleException;

/** Asaas status mapping and webhook transitions. */
class BillingRulesTest {

    @Test
    void mapsAsaasPaymentStatuses() {
        assertThat(BillingRules.invoiceStatusFromGateway("PENDING")).isEqualTo("OPEN");
        assertThat(BillingRules.invoiceStatusFromGateway("AWAITING_RISK_ANALYSIS")).isEqualTo("OPEN");
        assertThat(BillingRules.invoiceStatusFromGateway("CONFIRMED")).isEqualTo("PAID");
        assertThat(BillingRules.invoiceStatusFromGateway("RECEIVED")).isEqualTo("PAID");
        assertThat(BillingRules.invoiceStatusFromGateway("RECEIVED_IN_CASH")).isEqualTo("PAID");
        assertThat(BillingRules.invoiceStatusFromGateway("OVERDUE")).isEqualTo("OVERDUE");
        assertThat(BillingRules.invoiceStatusFromGateway("REFUNDED")).isEqualTo("REFUNDED");
        assertThat(BillingRules.invoiceStatusFromGateway("CHARGEBACK_REQUESTED")).isEqualTo("REFUNDED");
        assertThat(BillingRules.invoiceStatusFromGateway(null)).isEqualTo("OPEN");
        assertThat(BillingRules.invoiceStatusFromGateway("SOMETHING_NEW")).isEqualTo("OPEN");
        assertThat(BillingRules.isPaidStatus("CONFIRMED")).isTrue();
        assertThat(BillingRules.isPaidStatus("PENDING")).isFalse();
    }

    @Test
    void mapsWebhookEventsToActions() {
        assertThat(BillingRules.actionFor("PAYMENT_CREATED")).isEqualTo(WebhookAction.UPSERT);
        assertThat(BillingRules.actionFor("PAYMENT_UPDATED")).isEqualTo(WebhookAction.UPSERT);
        assertThat(BillingRules.actionFor("PAYMENT_CONFIRMED")).isEqualTo(WebhookAction.PAID);
        assertThat(BillingRules.actionFor("PAYMENT_RECEIVED")).isEqualTo(WebhookAction.PAID);
        assertThat(BillingRules.actionFor("PAYMENT_OVERDUE")).isEqualTo(WebhookAction.OVERDUE);
        assertThat(BillingRules.actionFor("PAYMENT_REFUNDED")).isEqualTo(WebhookAction.REFUNDED);
        assertThat(BillingRules.actionFor("PAYMENT_CHARGEBACK_REQUESTED")).isEqualTo(WebhookAction.REFUNDED);
        assertThat(BillingRules.actionFor("PAYMENT_DELETED")).isEqualTo(WebhookAction.DELETED);
        assertThat(BillingRules.actionFor("SUBSCRIPTION_CREATED")).isEqualTo(WebhookAction.IGNORE);
        assertThat(BillingRules.actionFor(null)).isEqualTo(WebhookAction.IGNORE);
    }

    @Test
    void paidEventStartsPeriodForSubscriptionAndPaysAddon() {
        Transition sub = BillingRules.transitionFor("PAYMENT_CONFIRMED", "CONFIRMED", "OPEN", false);
        assertThat(sub.invoiceStatus()).isEqualTo("PAID");
        assertThat(sub.subscription()).isEqualTo(SubscriptionEffect.START_PAID_PERIOD);
        assertThat(sub.addon()).isEqualTo(AddonEffect.NONE);

        Transition addon = BillingRules.transitionFor("PAYMENT_RECEIVED", "RECEIVED", null, true);
        assertThat(addon.invoiceStatus()).isEqualTo("PAID");
        assertThat(addon.subscription()).isEqualTo(SubscriptionEffect.NONE);
        assertThat(addon.addon()).isEqualTo(AddonEffect.PAID);
    }

    @Test
    void overdueRefundDeleteTransitions() {
        Transition overdue = BillingRules.transitionFor("PAYMENT_OVERDUE", "OVERDUE", "OPEN", false);
        assertThat(overdue.invoiceStatus()).isEqualTo("OVERDUE");
        assertThat(overdue.subscription()).isEqualTo(SubscriptionEffect.PAST_DUE);

        Transition refund = BillingRules.transitionFor("PAYMENT_REFUNDED", "REFUNDED", "PAID", true);
        assertThat(refund.invoiceStatus()).isEqualTo("REFUNDED");
        assertThat(refund.addon()).isEqualTo(AddonEffect.CANCELED);

        Transition deleted = BillingRules.transitionFor("PAYMENT_DELETED", "DELETED", "OPEN", false);
        assertThat(deleted.invoiceStatus()).isEqualTo("CANCELED");
        assertThat(deleted.subscription()).isEqualTo(SubscriptionEffect.NONE);
    }

    @Test
    void upsertNeverDowngradesSettledInvoices() {
        assertThat(BillingRules.transitionFor("PAYMENT_UPDATED", "PENDING", "PAID", false)
                .invoiceStatus()).isEqualTo("PAID");
        assertThat(BillingRules.transitionFor("PAYMENT_CREATED", "PENDING", null, false)
                .invoiceStatus()).isEqualTo("OPEN");
        Transition ignored = BillingRules.transitionFor("SUBSCRIPTION_UPDATED", null, "OPEN", false);
        assertThat(ignored.action()).isEqualTo(WebhookAction.IGNORE);
        assertThat(ignored.invoiceStatus()).isEqualTo("OPEN");
    }

    @Test
    void invoiceNumberAndPeriod() {
        LocalDate due = LocalDate.of(2026, 12, 5);
        assertThat(BillingRules.invoiceNumber("12345", "pay_abc", due)).isEqualTo("12345");
        assertThat(BillingRules.invoiceNumber(null, "pay_fake_0a1b2c3d4e", due))
                .isEqualTo("EIP-202612-2C3D4E");
        assertThat(BillingRules.period(due)).isEqualTo("2026-12");
    }

    @Test
    void periodEndByInterval() {
        OffsetDateTime start = BillingRules.startOfDay(LocalDate.of(2026, 1, 31));
        assertThat(BillingRules.periodEnd(start, BillingInterval.MONTHLY).toLocalDate())
                .isEqualTo(LocalDate.of(2026, 2, 28));
        assertThat(BillingRules.periodEnd(start, BillingInterval.ANNUAL).toLocalDate())
                .isEqualTo(LocalDate.of(2027, 1, 31));
    }

    @Test
    void parsesInterval() {
        assertThat(BillingRules.parseInterval("annual")).isEqualTo(BillingInterval.ANNUAL);
        assertThat(BillingRules.parseInterval(null)).isEqualTo(BillingInterval.MONTHLY);
        assertThatThrownBy(() -> BillingRules.parseInterval("WEEKLY"))
                .isInstanceOf(BusinessRuleException.class);
    }
}
