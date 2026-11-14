package com.eip.modules.marketdata.application;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eip.modules.marketdata.domain.model.ExpectativaCambio;
import com.eip.modules.marketdata.domain.port.in.ConsultarExpectativasUseCase;
import com.eip.modules.marketdata.domain.port.out.ExpectativasProviderPort;

import lombok.extern.slf4j.Slf4j;

/**
 * Serves the BCB Focus exchange-rate expectations for the current and next
 * calendar year, cached for 6 hours. If a refresh fails, the last good result
 * is served for up to 7 days; beyond that the call fails with 503.
 */
@Slf4j
@Service
public class ExpectativasService implements ConsultarExpectativasUseCase {

    static final Duration TTL = Duration.ofHours(6);
    static final Duration MAX_STALE = Duration.ofDays(7);
    private static final ZoneId SP = ZoneId.of("America/Sao_Paulo");

    private final ExpectativasProviderPort provider;
    private final Clock clock;

    private final Object lock = new Object();
    private List<ExpectativaCambio> cached;
    private Instant fetchedAt;

    @Autowired
    public ExpectativasService(ExpectativasProviderPort provider) {
        this(provider, Clock.systemUTC());
    }

    ExpectativasService(ExpectativasProviderPort provider, Clock clock) {
        this.provider = provider;
        this.clock = clock;
    }

    @Override
    public List<ExpectativaCambio> expectativasCambio() {
        synchronized (lock) {
            Instant now = clock.instant();
            if (cached != null && Duration.between(fetchedAt, now).compareTo(TTL) < 0) {
                return cached;
            }
            int ano = clock.instant().atZone(SP).getYear();
            Set<String> alvo = Set.of(String.valueOf(ano), String.valueOf(ano + 1));
            List<ExpectativaCambio> fresh = provider.buscarCambio().stream()
                    .filter(e -> alvo.contains(e.anoReferencia()))
                    .toList();
            if (!fresh.isEmpty()) {
                cached = fresh;
                fetchedAt = now;
                return cached;
            }
            if (cached != null && Duration.between(fetchedAt, now).compareTo(MAX_STALE) < 0) {
                log.warn("Expectativas Focus indisponiveis; servindo cache antigo de {}", fetchedAt);
                return cached;
            }
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Expectativas de mercado indisponíveis no momento.");
        }
    }
}
