package com.eip.modules.admin.adapter.out.gcp;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

/** Unit tests for the Identity Platform tenant display-name sanitizer. */
class GcpTenantNameTest {

    private static final UUID ORG = UUID.fromString("12345678-aaaa-bbbb-cccc-1234567890ab");

    private static void assertValid(String name) {
        assertThat(name).matches("[A-Za-z][A-Za-z0-9-]{3,19}");
    }

    @Test
    void stripsAccentsAndSymbols() {
        String n = GcpTenantProvisioningAdapter.sanitizeDisplayName("Exportação & Café Ltda", ORG);
        assertThat(n).isEqualTo("Exportacao-Cafe-Ltda");
        assertValid(n);
    }

    @Test
    void prefixesWhenNotStartingWithLetter() {
        String n = GcpTenantProvisioningAdapter.sanitizeDisplayName("123 Comercio", ORG);
        assertThat(n).startsWith("t-123");
        assertValid(n);
    }

    @Test
    void padsShortOrEmptyNamesWithOrgId() {
        String n = GcpTenantProvisioningAdapter.sanitizeDisplayName("ab", ORG);
        assertThat(n).startsWith("ab-12345678");
        assertValid(n);
        String empty = GcpTenantProvisioningAdapter.sanitizeDisplayName(null, ORG);
        assertThat(empty).startsWith("t-12345678");
        assertValid(empty);
    }

    @Test
    void cutsToTwentyCharsWithoutTrailingHyphen() {
        String n = GcpTenantProvisioningAdapter.sanitizeDisplayName(
                "Empresa Muito Longa Exportadora de Cafe", ORG);
        assertThat(n.length()).isLessThanOrEqualTo(20);
        assertThat(n).doesNotEndWith("-");
        assertValid(n);
    }
}
