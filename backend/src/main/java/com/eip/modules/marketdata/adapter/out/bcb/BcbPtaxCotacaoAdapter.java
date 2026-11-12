package com.eip.modules.marketdata.adapter.out.bcb;

import java.math.BigDecimal;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.core.annotation.Order;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.eip.modules.marketdata.domain.model.Cotacao;
import com.eip.modules.marketdata.domain.port.out.CotacaoProviderPort;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;

/**
 * Fallback source: official PTAX bulletins from Banco Central do Brasil (Olinda
 * OData, free). It publishes a few bulletins per business day, so it is less
 * "live" than AwesomeAPI, but it is the official reference rate. The BC does not
 * publish every currency (e.g. CNY and ARS are absent): those are simply
 * omitted. Looks back 7 days to cover weekends and holidays and takes the
 * latest bulletin of each currency.
 */
@Slf4j
@Component
@Order(2)
public class BcbPtaxCotacaoAdapter implements CotacaoProviderPort {

    private static final ZoneId SP = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter ODATA_DATE = DateTimeFormatter.ofPattern("MM-dd-yyyy");
    private static final String ODATA = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/";

    private final RestClient client;

    public BcbPtaxCotacaoAdapter() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(6));
        this.client = RestClient.builder()
                .requestFactory(factory)
                .defaultHeader("User-Agent", "EIP-Backend/1.0")
                .build();
    }

    @Override
    public Map<String, Cotacao> fetchBrl(Set<String> currencies) {
        Map<String, Cotacao> result = new HashMap<>();
        if (currencies == null) {
            return result;
        }
        for (String currency : currencies) {
            try {
                Cotacao c = fetchOne(currency);
                if (c != null) {
                    result.put(currency, c);
                }
            } catch (RuntimeException ex) {
                log.warn("BCB PTAX indisponivel para {}: {}", currency, ex.getMessage());
            }
        }
        return result;
    }

    private Cotacao fetchOne(String currency) {
        LocalDate today = LocalDate.now(SP);
        String from = today.minusDays(7).format(ODATA_DATE);
        String to = today.format(ODATA_DATE);
        String url;
        if ("USD".equals(currency)) {
            url = ODATA + "CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)"
                    + "?@dataInicial='" + from + "'&@dataFinalCotacao='" + to + "'";
        } else {
            url = ODATA + "CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)"
                    + "?@moeda='" + currency + "'&@dataInicial='" + from + "'&@dataFinalCotacao='" + to + "'";
        }
        url += "&$top=1&$orderby=dataHoraCotacao%20desc&$format=json";

        JsonNode root = client.get().uri(URI.create(url)).retrieve().body(JsonNode.class);
        JsonNode values = root == null ? null : root.path("value");
        if (values == null || !values.isArray() || values.isEmpty()) {
            return null;
        }
        JsonNode b = values.get(0);
        BigDecimal compra = b.path("cotacaoCompra").decimalValue();
        BigDecimal venda = b.path("cotacaoVenda").decimalValue();
        if (compra.signum() <= 0) {
            return null;
        }
        String raw = b.path("dataHoraCotacao").asText("");
        Instant quotedAt = raw.isBlank()
                ? Instant.now()
                : LocalDateTime.parse(raw.replace(' ', 'T')).atZone(SP).toInstant();
        return new Cotacao(currency + "/BRL", compra, venda, null, null, null, null,
                quotedAt, "BCB_PTAX", "PTAX Banco Central (boletim)");
    }
}