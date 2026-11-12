package com.eip.modules.marketdata.adapter.out.awesomeapi;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.core.annotation.Order;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.eip.modules.marketdata.domain.model.Cotacao;
import com.eip.modules.marketdata.domain.port.out.CotacaoProviderPort;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;

/**
 * Primary source: AwesomeAPI (free, no key), commercial exchange rates updated
 * continuously during market hours. One batched call serves all currencies:
 * {@code GET https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,...}
 */
@Slf4j
@Component
@Order(1)
public class AwesomeApiCotacaoAdapter implements CotacaoProviderPort {

    private static final String BASE_URL = "https://economia.awesomeapi.com.br/json/last/";

    private final RestClient client;

    public AwesomeApiCotacaoAdapter() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(4));
        this.client = RestClient.builder()
                .requestFactory(factory)
                .defaultHeader("User-Agent", "EIP-Backend/1.0")
                .build();
    }

    @Override
    public Map<String, Cotacao> fetchBrl(Set<String> currencies) {
        Map<String, Cotacao> result = new HashMap<>();
        if (currencies == null || currencies.isEmpty()) {
            return result;
        }
        try {
            String pairs = currencies.stream().map(c -> c + "-BRL").collect(Collectors.joining(","));
            JsonNode root = client.get().uri(BASE_URL + pairs).retrieve().body(JsonNode.class);
            if (root == null) {
                return result;
            }
            for (String currency : currencies) {
                JsonNode q = root.path(currency + "BRL");
                if (q.isMissingNode() || q.path("bid").asText("").isBlank()) {
                    continue;
                }
                BigDecimal bid = new BigDecimal(q.path("bid").asText());
                if (bid.signum() <= 0) {
                    continue;
                }
                long ts = q.path("timestamp").asLong(0);
                Instant quotedAt = ts > 0 ? Instant.ofEpochSecond(ts) : Instant.now();
                result.put(currency, new Cotacao(
                        currency + "/BRL", bid,
                        decimal(q, "ask"), decimal(q, "high"), decimal(q, "low"),
                        decimal(q, "pctChange"), decimal(q, "varBid"),
                        quotedAt, "AWESOMEAPI", "AwesomeAPI (câmbio comercial)"));
            }
        } catch (RuntimeException ex) {
            log.warn("AwesomeAPI indisponivel: {}", ex.getMessage());
        }
        return result;
    }

    private static BigDecimal decimal(JsonNode node, String field) {
        String v = node.path(field).asText("");
        if (v.isBlank()) {
            return null;
        }
        try {
            return new BigDecimal(v);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}