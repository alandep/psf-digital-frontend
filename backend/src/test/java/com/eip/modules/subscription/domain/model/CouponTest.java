package com.eip.modules.subscription.domain.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.Test;

/** Coupon validation rules ({@link Coupon#check}). */
class CouponTest {

    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-11-10T12:00:00Z");

    private static Coupon founders(int redeemed, boolean active, OffsetDateTime validUntil) {
        return new Coupon("FOUNDERS2026", "Programa Cliente Fundador EIP", "BUSINESS", "MONTHLY",
                new BigDecimal("1790.00"), 12, 50, redeemed, validUntil, active);
    }

    @Test
    void validForMatchingPlanAndInterval() {
        Coupon.Check check = founders(0, true, NOW.plusDays(30)).check("BUSINESS", "MONTHLY", NOW);
        assertThat(check.valid()).isTrue();
        assertThat(check.message()).isEqualTo("Cupom aplicado: R$ 1.790,00 por 12 cobranças.");
    }

    @Test
    void rejectsInactiveExpiredAndExhausted() {
        assertThat(founders(0, false, null).check("BUSINESS", "MONTHLY", NOW).message())
                .isEqualTo("Este cupom não está mais ativo.");
        assertThat(founders(0, true, NOW.minusSeconds(1)).check("BUSINESS", "MONTHLY", NOW).message())
                .isEqualTo("Este cupom expirou.");
        Coupon.Check exhausted = founders(50, true, null).check("BUSINESS", "MONTHLY", NOW);
        assertThat(exhausted.valid()).isFalse();
        assertThat(exhausted.message()).isEqualTo("Este cupom atingiu o limite de resgates.");
        assertThat(founders(49, true, null).check("BUSINESS", "MONTHLY", NOW).valid()).isTrue();
    }

    @Test
    void rejectsOtherPlanOrInterval() {
        Coupon c = founders(0, true, null);
        Coupon.Check otherPlan = c.check("PRO", "MONTHLY", NOW);
        assertThat(otherPlan.valid()).isFalse();
        assertThat(otherPlan.message()).isEqualTo("Este cupom é válido apenas para o plano EIP Business.");
        Coupon.Check annual = c.check("BUSINESS", "ANNUAL", NOW);
        assertThat(annual.valid()).isFalse();
        assertThat(annual.message()).isEqualTo("Este cupom é válido apenas para a cobrança mensal.");
    }

    @Test
    void previewWithoutSelectionSkipsPlanAndInterval() {
        assertThat(founders(0, true, null).check(null, null, NOW).valid()).isTrue();
    }

    @Test
    void unlimitedRedemptionsWhenMaxIsNull() {
        Coupon c = new Coupon("X", null, null, null, BigDecimal.TEN, 1, null, 10_000, null, true);
        Coupon.Check check = c.check("START", "ANNUAL", NOW);
        assertThat(check.valid()).isTrue();
        assertThat(check.message()).endsWith("por 1 cobrança.");
    }
}
