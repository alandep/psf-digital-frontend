package com.eip.modules.marketdata.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import com.eip.modules.marketdata.adapter.out.bcb.FocusExpectativasParser;
import com.eip.modules.marketdata.domain.model.ExpectativaCambio;
import com.eip.modules.marketdata.domain.port.out.ExpectativasProviderPort;

class FocusExpectativasTest {

    private static final String SAMPLE = """
            {"value":[
             {"Indicador":"Câmbio","Data":"2026-11-06","DataReferencia":"2027","Media":5.5,"Mediana":5.5,"baseCalculo":0},
             {"Indicador":"Câmbio","Data":"2026-11-06","DataReferencia":"2026","Media":5.3343,"Mediana":5.35,"baseCalculo":0},
             {"Indicador":"Câmbio","Data":"2026-10-30","DataReferencia":"2026","Media":5.2,"Mediana":5.25,"baseCalculo":0},
             {"Indicador":"Câmbio","Data":"2026-11-06","DataReferencia":"2028","Media":null,"Mediana":null,"baseCalculo":0}
            ]}""";

    @Test
    void parseKeepsLatestSurveyPerYearOrderedByYear() {
        List<ExpectativaCambio> r = FocusExpectativasParser.parse(SAMPLE);

        assertThat(r).extracting(ExpectativaCambio::anoReferencia).containsExactly("2026", "2027");
        ExpectativaCambio y2026 = r.get(0);
        assertThat(y2026.mediana()).isEqualByComparingTo("5.35");
        assertThat(y2026.media()).isEqualByComparingTo("5.3343");
        assertThat(y2026.dataPesquisa()).isEqualTo(LocalDate.of(2026, 11, 6));
        assertThat(y2026.fonte()).isEqualTo("BCB Focus");
    }

    @Test
    void parseReturnsEmptyOnMalformedOrEmptyBody() {
        assertThat(FocusExpectativasParser.parse("not json")).isEmpty();
        assertThat(FocusExpectativasParser.parse("{}")).isEmpty();
        assertThat(FocusExpectativasParser.parse(null)).isEmpty();
    }

    /** Clock whose time can be advanced by the test. */
    private static final class MutableClock extends Clock {
        private Instant now;

        MutableClock(Instant now) {
            this.now = now;
        }

        void advance(Duration d) {
            now = now.plus(d);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }

    private static ExpectativaCambio exp(String ano) {
        return new ExpectativaCambio(ano, new BigDecimal("5.3"), new BigDecimal("5.3"),
                LocalDate.of(2026, 11, 6), "BCB Focus");
    }

    @Test
    void serviceFiltersCurrentAndNextYearCachesAndServesStaleThenFails() {
        MutableClock clock = new MutableClock(Instant.parse("2026-11-10T12:00:00Z"));
        AtomicInteger calls = new AtomicInteger();
        boolean[] up = {true};
        ExpectativasProviderPort provider = () -> {
            calls.incrementAndGet();
            return up[0] ? List.of(exp("2025"), exp("2026"), exp("2027"), exp("2028")) : List.of();
        };
        ExpectativasService service = new ExpectativasService(provider, clock);

        assertThat(service.expectativasCambio()).extracting(ExpectativaCambio::anoReferencia)
                .containsExactly("2026", "2027");
        service.expectativasCambio();
        assertThat(calls.get()).isEqualTo(1);

        up[0] = false;
        clock.advance(Duration.ofHours(7));
        assertThat(service.expectativasCambio()).hasSize(2);
        assertThat(calls.get()).isEqualTo(2);

        clock.advance(Duration.ofDays(8));
        assertThatThrownBy(service::expectativasCambio)
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Expectativas de mercado indisponíveis no momento.");
    }
}
