package com.eip.modules.admin.application;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Regras puras da exportação de dados da organização: quais tabelas entram, quais colunas
 * sensíveis são omitidas e o nome do arquivo gerado.
 */
final class DataExportRules {

    private static final Pattern SAFE_IDENTIFIER = Pattern.compile("[a-z_][a-z0-9_]*");
    private static final DateTimeFormatter FILE_STAMP = DateTimeFormatter.ofPattern("yyyyMMdd-HHmm");

    /** Colunas que nunca saem na exportação (segredos, hashes e dados cifrados). */
    private static final List<String> SENSITIVE_MARKERS = List.of(
            "password", "secret", "ciphertext", "token_hash", "code_hash", "card_token",
            "lookup_hash", "api_key", "access_token", "refresh_token");

    /** Tabelas técnicas de infraestrutura (não são dados do cliente). */
    private static final List<String> EXCLUDED_TABLE_MARKERS = List.of(
            "flyway", "history", "outbox", "inbox", "event_publication", "billing_gateway_ref");

    private DataExportRules() {
    }

    static boolean isSensitiveColumn(String column) {
        if (column == null) {
            return true;
        }
        String name = column.toLowerCase(Locale.ROOT);
        return SENSITIVE_MARKERS.stream().anyMatch(name::contains);
    }

    static boolean isExcludedTable(String table) {
        if (table == null) {
            return true;
        }
        String name = table.toLowerCase(Locale.ROOT);
        return EXCLUDED_TABLE_MARKERS.stream().anyMatch(name::contains);
    }

    /** Apenas identificadores simples em minúsculas são aceitos (proteção ao montar o SQL). */
    static boolean isSafeIdentifier(String identifier) {
        return identifier != null && SAFE_IDENTIFIER.matcher(identifier).matches();
    }

    static String fileName(ZonedDateTime generatedAt) {
        return "eip-exportacao-" + FILE_STAMP.format(generatedAt) + ".zip";
    }
}
