package com.eip.modules.identity.application;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;

/** Unit tests for {@link RecoveryCodes}. */
class RecoveryCodesTest {

    @Test
    void generatesTenUniqueCodesInDisplayFormat() {
        List<String> codes = RecoveryCodes.generate();
        assertThat(codes).hasSize(10);
        assertThat(new HashSet<>(codes)).hasSize(10);
        assertThat(codes).allMatch(c -> c.matches("^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$"));
    }

    @Test
    void normalizeUppercasesAndStripsSeparators() {
        assertThat(RecoveryCodes.normalize("abcd-efgh ")).isEqualTo("ABCDEFGH");
        assertThat(RecoveryCodes.normalize(null)).isEmpty();
    }

    @Test
    void hashIsStableAndInsensitiveToFormatting() {
        UUID userId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        String hash = RecoveryCodes.hash(userId, "ABCD-EFGH");
        assertThat(hash).matches("[0-9a-f]{64}");
        assertThat(RecoveryCodes.hash(userId, "abcd efgh")).isEqualTo(hash);
        assertThat(RecoveryCodes.hash(UUID.randomUUID(), "ABCD-EFGH")).isNotEqualTo(hash);
    }

    /** Property: every generated code hashes identically to its normalized form. */
    @Test
    void generatedCodesHashLikeTheirNormalizedForm() {
        UUID userId = UUID.randomUUID();
        for (int i = 0; i < 50; i++) {
            for (String code : RecoveryCodes.generate()) {
                assertThat(RecoveryCodes.hash(userId, code.toLowerCase()))
                        .isEqualTo(RecoveryCodes.hash(userId, RecoveryCodes.normalize(code)));
            }
        }
    }
}
