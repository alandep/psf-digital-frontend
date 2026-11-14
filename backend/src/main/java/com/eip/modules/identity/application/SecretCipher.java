package com.eip.modules.identity.application;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * Encrypts MFA secrets at rest with AES-256-GCM (12-byte random IV, 128-bit
 * tag). Output format: {@code "v1:" + base64(iv || ciphertext+tag)}.
 *
 * <p>The key comes from {@code eip.security.mfa-encryption-key} (base64, 32
 * bytes). When it is blank and {@code eip.security.mfa-key-required=true}
 * (cloud) startup fails; otherwise a fixed DEV-only key is derived and a
 * warning is logged.
 */
@Slf4j
@Component
public class SecretCipher {

    private static final String PREFIX = "v1:";
    private static final int IV_BYTES = 12;
    private static final int TAG_BITS = 128;
    private static final int KEY_VERSION = 1;
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";

    private final SecureRandom random = new SecureRandom();
    private final SecretKeySpec key;

    /**
     * @param base64Key base64-encoded 32-byte key (may be blank outside required environments)
     * @param required  whether a configured key is mandatory
     */
    public SecretCipher(@Value("${eip.security.mfa-encryption-key:}") String base64Key,
                        @Value("${eip.security.mfa-key-required:false}") boolean required) {
        byte[] raw;
        if (base64Key == null || base64Key.isBlank()) {
            if (required) {
                throw new IllegalStateException(
                        "EIP_MFA_ENCRYPTION_KEY (base64 32 bytes) e obrigatoria neste ambiente");
            }
            log.warn("EIP_MFA_ENCRYPTION_KEY ausente: usando chave de DESENVOLVIMENTO para segredos MFA. "
                    + "Nunca use esta configuracao em producao.");
            raw = Digests.sha256("eip-dev-only-mfa-key".getBytes(StandardCharsets.UTF_8));
        } else {
            try {
                raw = Base64.getDecoder().decode(base64Key.trim());
            } catch (IllegalArgumentException ex) {
                throw new IllegalStateException("EIP_MFA_ENCRYPTION_KEY nao e um base64 valido", ex);
            }
            if (raw.length != 32) {
                throw new IllegalStateException(
                        "EIP_MFA_ENCRYPTION_KEY deve decodificar para 32 bytes (AES-256)");
            }
        }
        this.key = new SecretKeySpec(raw, "AES");
    }

    /** @return the version tag of the active key (stored alongside the ciphertext). */
    public int keyVersion() {
        return KEY_VERSION;
    }

    /** Encrypts {@code plaintext} (UTF-8). */
    public String encrypt(String plaintext) {
        try {
            byte[] iv = new byte[IV_BYTES];
            random.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            byte[] payload = ByteBuffer.allocate(iv.length + ciphertext.length)
                    .put(iv).put(ciphertext).array();
            return PREFIX + Base64.getEncoder().encodeToString(payload);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Falha ao cifrar segredo MFA", ex);
        }
    }

    /**
     * Decrypts a value produced by {@link #encrypt(String)}.
     *
     * @throws IllegalStateException when the value is malformed or authentication fails
     */
    public String decrypt(String stored) {
        if (stored == null || !stored.startsWith(PREFIX)) {
            throw new IllegalStateException("Formato de segredo MFA desconhecido");
        }
        try {
            byte[] payload = Base64.getDecoder().decode(stored.substring(PREFIX.length()));
            if (payload.length <= IV_BYTES) {
                throw new IllegalStateException("Segredo MFA truncado");
            }
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, payload, 0, IV_BYTES));
            byte[] plain = cipher.doFinal(payload, IV_BYTES, payload.length - IV_BYTES);
            return new String(plain, StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException ex) {
            throw new IllegalStateException("Falha ao decifrar segredo MFA", ex);
        }
    }
}
