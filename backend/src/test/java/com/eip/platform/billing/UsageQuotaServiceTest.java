package com.eip.platform.billing;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.eip.platform.billing.UsageQuotaService.Meter;

class UsageQuotaServiceTest {

    @Test
    void percentIsZeroWhenUnlimited() {
        assertThat(UsageQuotaService.percent(new BigDecimal("999"), null)).isZero();
    }

    @Test
    void percentRoundsAndClampsToHundred() {
        assertThat(UsageQuotaService.percent(new BigDecimal("1"), new BigDecimal("3"))).isEqualTo(33);
        assertThat(UsageQuotaService.percent(new BigDecimal("2"), new BigDecimal("3"))).isEqualTo(67);
        assertThat(UsageQuotaService.percent(new BigDecimal("600"), new BigDecimal("500"))).isEqualTo(100);
    }

    @Test
    void percentWithZeroIncludedDependsOnUsage() {
        assertThat(UsageQuotaService.percent(BigDecimal.ZERO, BigDecimal.ZERO)).isZero();
        assertThat(UsageQuotaService.percent(BigDecimal.ONE, BigDecimal.ZERO)).isEqualTo(100);
    }

    @Test
    void includedSumsPlanAndPacksOrIsNullWhenUnlimited() {
        assertThat(UsageQuotaService.include(new BigDecimal("500"), new BigDecimal("10000")))
                .isEqualByComparingTo("10500");
        assertThat(UsageQuotaService.include(new BigDecimal("500"), null)).isEqualByComparingTo("500");
        assertThat(UsageQuotaService.include(null, new BigDecimal("10000"))).isNull();
    }

    @Test
    void hasRoomOnlyWhileUsedIsBelowIncluded() {
        assertThat(UsageQuotaService.hasRoom(new BigDecimal("499"), new BigDecimal("500"))).isTrue();
        assertThat(UsageQuotaService.hasRoom(new BigDecimal("500"), new BigDecimal("500"))).isFalse();
        assertThat(UsageQuotaService.hasRoom(new BigDecimal("1000000"), null)).isTrue();
    }

    @Test
    void meterCombinesPlanAndPacks() {
        Meter m = UsageQuotaService.meter("AI", "Créditos de IA", "créditos",
                new BigDecimal("250"), new BigDecimal("500"), new BigDecimal("10000"));
        assertThat(m.included()).isEqualByComparingTo("10500");
        assertThat(m.fromPlan()).isEqualByComparingTo("500");
        assertThat(m.fromPacks()).isEqualByComparingTo("10000");
        assertThat(m.percent()).isEqualTo(2);
    }

    @Test
    void unlimitedMeterHasNullIncludedAndZeroPercent() {
        Meter m = UsageQuotaService.meter("OCR", "Páginas OCR", "páginas",
                new BigDecimal("42"), null, BigDecimal.ZERO);
        assertThat(m.included()).isNull();
        assertThat(m.fromPlan()).isNull();
        assertThat(m.percent()).isZero();
    }

    @Test
    void bytesToGbUsesTwoDecimals() {
        assertThat(UsageQuotaService.bytesToGb(1024L * 1024L * 1024L * 3L / 2L)).isEqualByComparingTo("1.50");
        assertThat(UsageQuotaService.bytesToGb(0)).isEqualByComparingTo("0.00");
    }

    @Test
    void operationLabelsAreLocalizedAndDefaultToRaw() {
        assertThat(UsageQuotaService.operationLabel("NCM_CLASSIFICATION")).isEqualTo("Classificação NCM");
        assertThat(UsageQuotaService.operationLabel("CHAT")).isEqualTo("Copiloto / Chat");
        assertThat(UsageQuotaService.operationLabel("SOMETHING_NEW")).isEqualTo("SOMETHING_NEW");
    }

    @Test
    void amountIsNormalizedWithoutTrailingZeros() {
        assertThat(UsageQuotaService.normalizeAmount(new BigDecimal("5.00")).toPlainString()).isEqualTo("5");
        assertThat(UsageQuotaService.normalizeAmount(new BigDecimal("100.00")).toPlainString()).isEqualTo("100");
        assertThat(UsageQuotaService.normalizeAmount(new BigDecimal("2.50")).toPlainString()).isEqualTo("2.5");
    }

    @Test
    void fallbackPeriodIsTheCalendarMonth() {
        UsageQuotaService.Period p = UsageQuotaService.currentMonth(LocalDate.of(2026, 11, 17));
        assertThat(p.start().toLocalDate()).isEqualTo(LocalDate.of(2026, 11, 1));
        assertThat(p.end().toLocalDate()).isEqualTo(LocalDate.of(2026, 12, 1));
    }
}
