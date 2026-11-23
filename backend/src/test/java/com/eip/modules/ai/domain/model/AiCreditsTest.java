package com.eip.modules.ai.domain.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

class AiCreditsTest {

    @Test
    void noTokensConsumeNothing() {
        assertThat(AiCredits.of(0, 0, 0)).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void anyTokenCostsAtLeastOneCredit() {
        assertThat(AiCredits.of(1, 0, 0)).isEqualByComparingTo("1");
        assertThat(AiCredits.of(0, 1, 0)).isEqualByComparingTo("1");
    }

    @Test
    void appliesWeightedFormulaRoundingUp() {
        // (1000 + 5 * (200 + 100)) / 1000 = 2.5 -> 3
        assertThat(AiCredits.of(1000, 200, 100)).isEqualByComparingTo("3");
        // (2000 + 5 * 0) / 1000 = 2 exatos
        assertThat(AiCredits.of(2000, 0, 0)).isEqualByComparingTo("2");
        // (0 + 5 * 1000) / 1000 = 5
        assertThat(AiCredits.of(0, 600, 400)).isEqualByComparingTo("5");
    }

    @Test
    void thinkingTokensCountLikeOutputTokens() {
        assertThat(AiCredits.of(100, 0, 500)).isEqualByComparingTo(AiCredits.of(100, 500, 0));
    }
}
