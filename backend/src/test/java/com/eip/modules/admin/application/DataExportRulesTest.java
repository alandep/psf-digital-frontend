package com.eip.modules.admin.application;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.junit.jupiter.api.Test;

class DataExportRulesTest {

    @Test
    void sensitiveColumnsAreOmitted() {
        assertThat(DataExportRules.isSensitiveColumn("password_hash")).isTrue();
        assertThat(DataExportRules.isSensitiveColumn("secret_ciphertext")).isTrue();
        assertThat(DataExportRules.isSensitiveColumn("token_hash")).isTrue();
        assertThat(DataExportRules.isSensitiveColumn("code_hash")).isTrue();
        assertThat(DataExportRules.isSensitiveColumn("card_token")).isTrue();
        assertThat(DataExportRules.isSensitiveColumn("cpf_ciphertext")).isTrue();
    }

    @Test
    void regularColumnsAreKept() {
        assertThat(DataExportRules.isSensitiveColumn("organization_id")).isFalse();
        assertThat(DataExportRules.isSensitiveColumn("created_at")).isFalse();
        assertThat(DataExportRules.isSensitiveColumn("name")).isFalse();
    }

    @Test
    void infrastructureTablesAreExcluded() {
        assertThat(DataExportRules.isExcludedTable("flyway_schema_history")).isTrue();
        assertThat(DataExportRules.isExcludedTable("outbox_event")).isTrue();
        assertThat(DataExportRules.isExcludedTable("inbox_message")).isTrue();
        assertThat(DataExportRules.isExcludedTable("event_publication")).isTrue();
        assertThat(DataExportRules.isExcludedTable("document")).isFalse();
    }

    @Test
    void onlySimpleIdentifiersAreAccepted() {
        assertThat(DataExportRules.isSafeIdentifier("ai_usage_event")).isTrue();
        assertThat(DataExportRules.isSafeIdentifier("x\"; drop table y; --")).isFalse();
        assertThat(DataExportRules.isSafeIdentifier("Document")).isFalse();
    }

    @Test
    void fileNameUsesTimestamp() {
        ZonedDateTime when = ZonedDateTime.of(2026, 11, 5, 9, 7, 0, 0, ZoneId.of("America/Sao_Paulo"));
        assertThat(DataExportRules.fileName(when)).isEqualTo("eip-exportacao-20261105-0907.zip");
    }
}
