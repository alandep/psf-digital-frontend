package com.eip.modules.identity.application;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/** Small hashing / masking helpers shared by the identity use cases. */
final class Digests {

    private Digests() {
    }

    /** @return lowercase hex SHA-256 of the UTF-8 bytes of {@code value}. */
    static String sha256Hex(String value) {
        return HexFormat.of().formatHex(sha256(value.getBytes(StandardCharsets.UTF_8)));
    }

    static byte[] sha256(byte[] value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponivel", ex);
        }
    }

    /** @return {@code a***@domain} for an e-mail address, {@code null} for blank input. */
    static String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        String value = email.trim();
        int at = value.indexOf('@');
        if (at < 0) {
            return value.substring(0, 1) + "***";
        }
        String visible = at == 0 ? "" : value.substring(0, 1);
        return visible + "***" + value.substring(at);
    }
}
