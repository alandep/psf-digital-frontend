package com.eip.modules.subscription.application;

import java.time.OffsetDateTime;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.eip.modules.subscription.application.BillingCommands.DemoCommand;
import com.eip.modules.subscription.domain.port.out.DemoRequestPort;
import com.eip.modules.subscription.domain.port.out.DemoRequestPort.DemoRequest;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.mail.EmailSender;
import com.eip.platform.mail.EmailTemplates;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Public "fale com vendas / demonstração" requests: stored in {@code demo_request}
 * and e-mailed to {@code eip.billing.sales-email}. Rate limited in memory to
 * {@value #MAX_PER_WINDOW} requests per IP per hour (per instance).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DemoRequestService {

    static final int MAX_PER_WINDOW = 5;
    static final long WINDOW_MILLIS = 60L * 60L * 1000L;
    private static final Set<String> ORIGINS = Set.of("SITE", "PRECOS_ENTERPRISE", "TRIAL_BANNER",
            "CHECKOUT");
    private static final String EMAIL_PATTERN = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$";

    private final DemoRequestPort demoRequests;
    private final EmailSender emailSender;
    private final BillingProperties props;

    private final Map<String, Deque<Long>> hitsByIp = new ConcurrentHashMap<>();

    @Transactional
    public void request(DemoCommand c, String ip) {
        checkRateLimit(ip, System.currentTimeMillis());
        if (c == null || isBlank(c.nome())) {
            throw new BusinessRuleException("Informe seu nome.");
        }
        if (isBlank(c.email()) || !c.email().trim().matches(EMAIL_PATTERN)) {
            throw new BusinessRuleException("Informe um e-mail válido.");
        }
        if (isBlank(c.telefone())) {
            throw new BusinessRuleException("Informe um telefone para contato.");
        }
        if (isBlank(c.empresa())) {
            throw new BusinessRuleException("Informe o nome da empresa.");
        }
        String origin = c.origem() == null ? "SITE" : c.origem().trim().toUpperCase(Locale.ROOT);
        if (!ORIGINS.contains(origin)) {
            origin = "SITE";
        }
        DemoRequest r = new DemoRequest(UUID.randomUUID(), limit(c.nome(), 200),
                c.email().trim().toLowerCase(Locale.ROOT), limit(c.telefone(), 40),
                limit(c.empresa(), 200), limit(c.cnpj(), 20), limit(c.mensagem(), 4000), origin,
                ip, OffsetDateTime.now());
        demoRequests.save(r);
        EmailTemplates.Rendered mail = EmailTemplates.demoRequest(r.name(), r.email(), r.phone(),
                r.company(), r.cnpj(), r.message(), r.origin());
        emailSender.send(props.salesEmail(), mail.subject(), mail.text(), mail.html());
        log.info("Solicitacao de demonstracao registrada id={} origem={}", r.id(), origin);
    }

    /** Sliding one-hour window per IP. */
    void checkRateLimit(String ip, long nowMillis) {
        String key = ip == null || ip.isBlank() ? "unknown" : ip;
        if (hitsByIp.size() > 10_000) {
            hitsByIp.entrySet().removeIf(e -> {
                Long last = e.getValue().peekLast();
                return last == null || nowMillis - last > WINDOW_MILLIS;
            });
        }
        Deque<Long> hits = hitsByIp.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (hits) {
            while (!hits.isEmpty() && nowMillis - hits.peekFirst() > WINDOW_MILLIS) {
                hits.pollFirst();
            }
            if (hits.size() >= MAX_PER_WINDOW) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Muitas solicitações enviadas. Tente novamente mais tarde.");
            }
            hits.addLast(nowMillis);
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private static String limit(String v, int max) {
        if (v == null) {
            return null;
        }
        String t = v.trim();
        return t.length() <= max ? t : t.substring(0, max);
    }
}
