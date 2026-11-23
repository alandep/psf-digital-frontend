package com.eip.modules.admin.application;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.Test;

/** daysRemaining = ceil(remaining hours / 24) (billing contract, section 5). */
class OnboardingTrialDaysTest {

    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-11-10T12:00:00Z");

    @Test
    void roundsUpPartialDays() {
        assertThat(OnboardingService.daysRemaining(NOW.plusDays(14), NOW)).isEqualTo(14);
        assertThat(OnboardingService.daysRemaining(NOW.plusDays(13).plusHours(23), NOW)).isEqualTo(14);
        assertThat(OnboardingService.daysRemaining(NOW.plusMinutes(30), NOW)).isEqualTo(1);
        assertThat(OnboardingService.daysRemaining(NOW.plusHours(25), NOW)).isEqualTo(2);
    }

    @Test
    void zeroWhenExpiredOrUnknown() {
        assertThat(OnboardingService.daysRemaining(NOW, NOW)).isZero();
        assertThat(OnboardingService.daysRemaining(NOW.minusHours(1), NOW)).isZero();
        assertThat(OnboardingService.daysRemaining(null, NOW)).isZero();
    }
}
