package com.eip.modules.marketdata.application;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.eip.modules.marketdata.domain.model.Cotacao;
import com.eip.modules.marketdata.domain.port.in.ConsultarCotacaoUseCase;
import com.eip.modules.marketdata.domain.port.out.CotacaoProviderPort;

import lombok.extern.slf4j.Slf4j;

/**
 * Serves currency-vs-BRL quotes with a per-currency server-side cache so
 * upstream sources are hit at most once per TTL regardless of how many users
 * poll the toolbar or the exchange screen.
 *
 * <ul>
 *   <li>Fresh cache (age &lt; TTL): returned without any network call.</li>
 *   <li>Otherwise the missing/expired currencies are fetched together, trying
 *       the sources in order (AwesomeAPI, then BCB PTAX) for whatever is still
 *       unresolved.</li>
 *   <li>If a currency cannot be refreshed, its last good value is served
 *       flagged {@code stale} for up to {@code maxStale}; beyond that it is
 *       omitted (never a made-up number). Failed currencies are not retried
 *       before a short backoff, to avoid hammering the sources.</li>
 * </ul>
 */
@Slf4j
@Service
public class CotacaoService implements ConsultarCotacaoUseCase {

    private static final Duration RETRY_BACKOFF = Duration.ofSeconds(10);

    /** Currencies quoted against BRL. */
    private static final Set<String> SUPPORTED =
            Set.of("USD", "EUR", "GBP", "JPY", "CNY", "ARS", "CAD", "AUD", "CHF");

    private final List<CotacaoProviderPort> providers;
    private final Duration ttl;
    private final Duration maxStale;

    private final Object lock = new Object();
    private final Map<String, Snapshot> cache = new ConcurrentHashMap<>();
    private final Map<String, Instant> retryNotBefore = new ConcurrentHashMap<>();

    public CotacaoService(
            List<CotacaoProviderPort> providers,
            @Value("${eip.marketdata.cache-ttl-seconds:30}") long ttlSeconds,
            @Value("${eip.marketdata.max-stale-minutes:30}") long maxStaleMinutes) {
        this.providers = providers;
        this.ttl = Duration.ofSeconds(ttlSeconds);
        this.maxStale = Duration.ofMinutes(maxStaleMinutes);
    }

    private record Snapshot(Cotacao cotacao, Instant fetchedAt, BigDecimal previousBid) {
    }

    @Override
    public Set<String> moedasSuportadas() {
        return SUPPORTED;
    }

    @Override
    public CotacaoView cotacao(String moeda) {
        List<CotacaoView> views = cotacoes(List.of(moeda));
        return views.get(0);
    }

    @Override
    public List<CotacaoView> cotacoes(List<String> moedas) {
        Set<String> wanted = normalize(moedas);
        Instant now = Instant.now();

        Set<String> need = new LinkedHashSet<>();
        for (String c : wanted) {
            if (!isFresh(cache.get(c), now)) {
                need.add(c);
            }
        }
        if (!need.isEmpty()) {
            refresh(need);
        }

        now = Instant.now();
        List<CotacaoView> views = new ArrayList<>();
        for (String c : wanted) {
            Snapshot s = cache.get(c);
            if (isFresh(s, now)) {
                views.add(toView(c, s, false));
            } else if (s != null && Duration.between(s.fetchedAt(), now).compareTo(maxStale) < 0) {
                views.add(toView(c, s, true));
            }
        }
        if (views.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Cotacao indisponivel no momento.");
        }
        return views;
    }

    private void refresh(Set<String> need) {
        synchronized (lock) {
            Instant now = Instant.now();
            Set<String> remaining = new LinkedHashSet<>();
            for (String c : need) {
                // Another thread may have refreshed it while we waited for the lock.
                if (isFresh(cache.get(c), now)) {
                    continue;
                }
                Instant notBefore = retryNotBefore.get(c);
                if (notBefore != null && now.isBefore(notBefore)) {
                    continue;
                }
                remaining.add(c);
            }
            for (CotacaoProviderPort provider : providers) {
                if (remaining.isEmpty()) {
                    break;
                }
                Map<String, Cotacao> got = provider.fetchBrl(new LinkedHashSet<>(remaining));
                for (Map.Entry<String, Cotacao> e : got.entrySet()) {
                    Snapshot prev = cache.get(e.getKey());
                    BigDecimal prevBid = prev == null ? null : prev.cotacao().bid();
                    cache.put(e.getKey(), new Snapshot(e.getValue(), now, prevBid));
                    retryNotBefore.remove(e.getKey());
                    remaining.remove(e.getKey());
                }
            }
            for (String unresolved : remaining) {
                retryNotBefore.put(unresolved, now.plus(RETRY_BACKOFF));
                log.error("Nenhuma fonte de cotacao respondeu para {}/BRL", unresolved);
            }
        }
    }

    private boolean isFresh(Snapshot s, Instant now) {
        return s != null && Duration.between(s.fetchedAt(), now).compareTo(ttl) < 0;
    }

    private Set<String> normalize(List<String> moedas) {
        Set<String> out = new LinkedHashSet<>();
        if (moedas != null) {
            for (String m : moedas) {
                if (m == null || m.isBlank()) {
                    continue;
                }
                String code = m.trim().toUpperCase(Locale.ROOT);
                if (!SUPPORTED.contains(code)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Moeda nao suportada: " + code);
                }
                out.add(code);
            }
        }
        if (out.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe ao menos uma moeda.");
        }
        return out;
    }

    private CotacaoView toView(String currency, Snapshot s, boolean stale) {
        Cotacao c = s.cotacao();
        BigDecimal previousClose = c.varBid() == null ? null : c.bid().subtract(c.varBid());
        return new CotacaoView(
                currency, c.pair(), c.bid(), c.bid(), c.ask(), c.high(), c.low(),
                c.pctChange(), c.varBid(), previousClose,
                trend(c, s.previousBid()), c.source(), c.sourceLabel(), c.quotedAt(), stale);
    }

    /** Prefers the real day variation; falls back to comparing with the prior fetch. */
    private static String trend(Cotacao c, BigDecimal previousBid) {
        int cmp;
        if (c.pctChange() != null) {
            cmp = c.pctChange().signum();
        } else if (previousBid != null) {
            cmp = c.bid().compareTo(previousBid);
        } else {
            cmp = 0;
        }
        return cmp > 0 ? "up" : cmp < 0 ? "down" : "stable";
    }
}