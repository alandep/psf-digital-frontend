package com.eip.modules.marketdata.adapter.out.bcb;

import java.net.URI;
import java.time.Duration;
import java.util.List;

import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.eip.modules.marketdata.domain.model.ExpectativaCambio;
import com.eip.modules.marketdata.domain.port.out.ExpectativasProviderPort;

import lombok.extern.slf4j.Slf4j;

/**
 * Annual exchange-rate expectations from the BCB Focus survey (Olinda OData,
 * free). Never throws: any failure yields an empty list.
 */
@Slf4j
@Component
public class BcbFocusExpectativasAdapter implements ExpectativasProviderPort {

    /** Spaces, quotes and accents are pre-encoded; the URI is used as-is. */
    static final String URL =
            "https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/"
                    + "ExpectativasMercadoAnuais?$top=20"
                    + "&$filter=Indicador%20eq%20%27C%C3%A2mbio%27%20and%20baseCalculo%20eq%200"
                    + "&$orderby=Data%20desc&$format=json"
                    + "&$select=Indicador,Data,DataReferencia,Media,Mediana,baseCalculo";

    private final RestClient client;

    public BcbFocusExpectativasAdapter() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(8));
        this.client = RestClient.builder()
                .requestFactory(factory)
                .defaultHeader("User-Agent", "EIP-Backend/1.0")
                .build();
    }

    @Override
    public List<ExpectativaCambio> buscarCambio() {
        try {
            String body = client.get().uri(URI.create(URL)).retrieve().body(String.class);
            return FocusExpectativasParser.parse(body);
        } catch (RuntimeException ex) {
            log.warn("BCB Focus indisponivel: {}", ex.getMessage());
            return List.of();
        }
    }
}
