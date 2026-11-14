package com.eip.modules.marketdata.adapter.out.bcb;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import com.eip.modules.marketdata.domain.model.ExpectativaCambio;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Parses the Olinda "ExpectativasMercadoAnuais" response and keeps, for each
 * reference year, the row of the most recent survey date. Pure function.
 */
public final class FocusExpectativasParser {

    static final String FONTE = "BCB Focus";

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private FocusExpectativasParser() {
    }

    /**
     * @param json raw response body
     * @return latest expectation per reference year, ordered by year; empty when
     *         the body is malformed or has no usable rows
     */
    public static List<ExpectativaCambio> parse(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        JsonNode root;
        try {
            root = MAPPER.readTree(json);
        } catch (JsonProcessingException ex) {
            return List.of();
        }
        JsonNode values = root == null ? null : root.path("value");
        if (values == null || !values.isArray()) {
            return List.of();
        }
        Map<String, ExpectativaCambio> porAno = new TreeMap<>();
        for (JsonNode row : values) {
            ExpectativaCambio e = toExpectativa(row);
            if (e == null) {
                continue;
            }
            ExpectativaCambio atual = porAno.get(e.anoReferencia());
            if (atual == null || e.dataPesquisa().isAfter(atual.dataPesquisa())) {
                porAno.put(e.anoReferencia(), e);
            }
        }
        return new ArrayList<>(porAno.values());
    }

    private static ExpectativaCambio toExpectativa(JsonNode row) {
        String ano = row.path("DataReferencia").asText("").trim();
        JsonNode mediana = row.path("Mediana");
        if (ano.isEmpty() || !mediana.isNumber()) {
            return null;
        }
        LocalDate data;
        try {
            data = LocalDate.parse(row.path("Data").asText(""));
        } catch (DateTimeParseException ex) {
            return null;
        }
        JsonNode media = row.path("Media");
        return new ExpectativaCambio(
                ano,
                mediana.decimalValue(),
                media.isNumber() ? media.decimalValue() : (BigDecimal) null,
                data,
                FONTE);
    }
}
