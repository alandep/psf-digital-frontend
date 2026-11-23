package com.eip.modules.subscription.domain.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.eip.platform.error.BusinessRuleException;

/** License rules (contract section 5) and billing transitions of the aggregate. */
class SubscriptionTest {

    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-11-10T12:00:00Z");

    private static Subscription trial(OffsetDateTime trialEnd, String gatewaySubscriptionId) {
        return new Subscription(SubscriptionId.newId(), UUID.randomUUID(), PlanCode.BUSINESS,
                "EIP Business", BillingInterval.MONTHLY, new BigDecimal("2490.00"),
                SubscriptionStatus.TRIALING, NOW.minusDays(14), trialEnd, trialEnd, false, null,
                null, 0L, new BillingDetails("cus_1", gatewaySubscriptionId, "CREDIT_CARD", "tok",
                        null, null, null, null, null, null, null));
    }

    @Test
    void licenseRulesMatchContract() {
        assertThat(Subscription.licenseModeOf(SubscriptionStatus.TRIALING, NOW.plusDays(1), null,
                false, NOW)).isEqualTo(LicenseMode.FULL);
        assertThat(Subscription.licenseModeOf(SubscriptionStatus.TRIALING, NOW.minusDays(1), null,
                false, NOW)).isEqualTo(LicenseMode.BILLING_ONLY);
        assertThat(Subscription.licenseModeOf(SubscriptionStatus.TRIALING, NOW.minusDays(1), null,
                true, NOW)).isEqualTo(LicenseMode.FULL);
        assertThat(Subscription.licenseModeOf(SubscriptionStatus.TRIALING, NOW.minusDays(3).minusMinutes(1),
                null, true, NOW)).isEqualTo(LicenseMode.READ_ONLY);
        assertThat(Subscription.licenseModeOf(SubscriptionStatus.ACTIVE, null, null, false, NOW))
                .isEqualTo(LicenseMode.FULL);
        assertThat(Subscription.licenseModeOf(SubscriptionStatus.PAST_DUE, null, null, true, NOW))
                .isEqualTo(LicenseMode.READ_ONLY);
        assertThat(Subscription.licenseModeOf(SubscriptionStatus.SUSPENDED, null, null, true, NOW))
                .isEqualTo(LicenseMode.BILLING_ONLY);
        assertThat(Subscription.licenseModeOf(SubscriptionStatus.CANCELED, null, NOW.plusDays(1),
                false, NOW)).isEqualTo(LicenseMode.FULL);
        assertThat(Subscription.licenseModeOf(SubscriptionStatus.CANCELED, null, NOW.minusDays(1),
                false, NOW)).isEqualTo(LicenseMode.READ_ONLY);
        assertThat(Subscription.licenseModeOf(SubscriptionStatus.TERMINATED, null, null, false, NOW))
                .isEqualTo(LicenseMode.NONE);
    }

    @Test
    void paidPeriodIsIdempotentAndConsumesCouponOnce() {
        Subscription s = trial(NOW.plusDays(1), "sub_1");
        s.applyCoupon("FOUNDERS2026", new BigDecimal("1790.00"), 2);
        assertThat(s.chargeAmount()).isEqualByComparingTo("1790.00");

        OffsetDateTime start = BillingRules.startOfDay(LocalDate.of(2026, 11, 24));
        OffsetDateTime end = BillingRules.periodEnd(start, BillingInterval.MONTHLY);
        assertThat(s.startPaidPeriod(start, end)).isTrue();
        assertThat(s.status()).isEqualTo(SubscriptionStatus.ACTIVE);
        assertThat(s.nextDueDate()).isEqualTo(LocalDate.of(2026, 12, 24));
        assertThat(s.consumeCouponCycle()).isFalse();
        // Same payment confirmed twice (CONFIRMED then RECEIVED): no new period.
        assertThat(s.startPaidPeriod(start, end)).isFalse();

        OffsetDateTime next = end;
        assertThat(s.startPaidPeriod(next, BillingRules.periodEnd(next, BillingInterval.MONTHLY)))
                .isTrue();
        assertThat(s.consumeCouponCycle()).isTrue();
        s.clearCoupon();
        assertThat(s.chargeAmount()).isEqualByComparingTo("2490.00");
    }

    @Test
    void cancelAndReactivate() {
        Subscription s = trial(NOW.plusDays(5), "sub_1");
        s.cancel("Preço", NOW);
        assertThat(s.status()).isEqualTo(SubscriptionStatus.CANCELED);
        assertThat(s.cancelAtPeriodEnd()).isTrue();
        assertThat(s.gatewayLinked()).isFalse();
        assertThat(s.licenseMode(NOW)).isEqualTo(LicenseMode.FULL);
        assertThatThrownBy(() -> s.cancel("x", NOW)).isInstanceOf(BusinessRuleException.class);

        assertThat(s.canReactivate(NOW)).isTrue();
        s.reactivate("sub_2", LocalDate.of(2026, 11, 15), NOW);
        assertThat(s.status()).isEqualTo(SubscriptionStatus.TRIALING);
        assertThat(s.gatewayLinked()).isTrue();
        assertThat(s.cancelAtPeriodEnd()).isFalse();
        assertThat(s.canceledAt()).isNull();
    }

    @Test
    void reactivateAfterPeriodEndIsRejected() {
        Subscription s = trial(NOW.minusDays(1), null);
        s.cancel("x", NOW.minusDays(2));
        assertThat(s.canReactivate(NOW)).isFalse();
        assertThatThrownBy(() -> s.reactivate("sub_3", LocalDate.now(), NOW))
                .isInstanceOf(BusinessRuleException.class);
    }
}
