package com.eip.modules.identity.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Base64;

import org.junit.jupiter.api.Test;

/** Unit tests for {@link SecretCipher} (AES-256-GCM). */
class SecretCipherTest {

    private static final String KEY = Base64.getEncoder().encodeToString(new byte[] {
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
            17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32});

    @Test
    void roundTripsWithExplicitKey() {
        SecretCipher cipher = new SecretCipher(KEY, true);
        String secret = TotpCodec.newSecretBase32();
        String encrypted = cipher.encrypt(secret);
        assertThat(encrypted).startsWith("v1:").doesNotContain(secret);
        assertThat(cipher.decrypt(encrypted)).isEqualTo(secret);
        assertThat(cipher.keyVersion()).isEqualTo(1);
    }

    @Test
    void usesRandomIvPerEncryption() {
        SecretCipher cipher = new SecretCipher(KEY, true);
        assertThat(cipher.encrypt("same")).isNotEqualTo(cipher.encrypt("same"));
    }

    @Test
    void rejectsTamperedCiphertextAndOtherKeys() {
        SecretCipher cipher = new SecretCipher(KEY, true);
        String encrypted = cipher.encrypt("payload");
        byte[] raw = Base64.getDecoder().decode(encrypted.substring(3));
        raw[raw.length - 1] ^= 0x01;
        String tampered = "v1:" + Base64.getEncoder().encodeToString(raw);
        assertThatThrownBy(() -> cipher.decrypt(tampered)).isInstanceOf(IllegalStateException.class);

        SecretCipher devCipher = new SecretCipher("", false);
        assertThatThrownBy(() -> devCipher.decrypt(encrypted)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void blankKeyIsRejectedWhenRequired() {
        assertThatThrownBy(() -> new SecretCipher("  ", true))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("EIP_MFA_ENCRYPTION_KEY");
    }

    @Test
    void blankKeyFallsBackToDevKeyWhenNotRequired() {
        SecretCipher first = new SecretCipher(null, false);
        SecretCipher second = new SecretCipher("", false);
        assertThat(second.decrypt(first.encrypt("abc"))).isEqualTo("abc");
    }

    @Test
    void keyMustDecodeTo32Bytes() {
        String shortKey = Base64.getEncoder().encodeToString(new byte[16]);
        assertThatThrownBy(() -> new SecretCipher(shortKey, false))
                .isInstanceOf(IllegalStateException.class);
    }
}
