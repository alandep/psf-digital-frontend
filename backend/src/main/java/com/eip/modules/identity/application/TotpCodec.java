package com.eip.modules.identity.application;

import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Locale;
import java.util.OptionalLong;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * RFC 6238 TOTP (HmacSHA1, 6 digits, 30 s period) plus an RFC 4648 Base32
 * codec. Pure JDK, stateless.
 *
 * <p>Verification accepts a &plusmn;1 step window to tolerate clock drift and
 * rejects any step that is not strictly greater than the last accepted one,
 * so a code can never be replayed.
 */
public final class TotpCodec {

    /** Number of digits of a generated code. */
    public static final int DIGITS = 6;
    /** Time-step length in seconds. */
    public static final long PERIOD_SECONDS = 30;

    private static final int SECRET_BYTES = 20;
    private static final int[] POW10 = {1, 10, 100, 1_000, 10_000, 100_000, 1_000_000,
            10_000_000, 100_000_000};
    private static final char[] BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".toCharArray();
    private static final SecureRandom RANDOM = new SecureRandom();

    private TotpCodec() {
    }

    /** @return a fresh random 160-bit secret, Base32-encoded without padding. */
    public static String newSecretBase32() {
        byte[] secret = new byte[SECRET_BYTES];
        RANDOM.nextBytes(secret);
        return base32Encode(secret);
    }

    /** @return the RFC 6238 time step containing {@code now}. */
    public static long currentStep(Instant now) {
        return Math.floorDiv(now.getEpochSecond(), PERIOD_SECONDS);
    }

    /**
     * Verifies a user-supplied code.
     *
     * @param base32Secret the shared secret (Base32)
     * @param code         the 6-digit code typed by the user (whitespace ignored)
     * @param lastUsedStep the last step already accepted for this secret
     * @param now          reference instant
     * @return the matched step, or empty when the code is invalid or replayed
     */
    public static OptionalLong verify(String base32Secret, String code, long lastUsedStep, Instant now) {
        if (base32Secret == null || code == null) {
            return OptionalLong.empty();
        }
        String normalized = code.replaceAll("\\s", "");
        if (normalized.length() != DIGITS || !normalized.chars().allMatch(Character::isDigit)) {
            return OptionalLong.empty();
        }
        byte[] key;
        try {
            key = base32Decode(base32Secret);
        } catch (IllegalArgumentException ex) {
            return OptionalLong.empty();
        }
        if (key.length == 0) {
            return OptionalLong.empty();
        }
        byte[] given = normalized.getBytes(StandardCharsets.US_ASCII);
        long current = currentStep(now);
        long matched = -1;
        // Evaluate the whole window (no early exit) to keep timing uniform.
        for (long step = current - 1; step <= current + 1; step++) {
            byte[] expected = generate(key, step).getBytes(StandardCharsets.US_ASCII);
            boolean equal = MessageDigest.isEqual(expected, given);
            if (equal && step > lastUsedStep && matched < 0) {
                matched = step;
            }
        }
        return matched < 0 ? OptionalLong.empty() : OptionalLong.of(matched);
    }

    /**
     * Builds the {@code otpauth://} provisioning URI rendered as a QR code by the SPA.
     *
     * @param issuer  issuer label (e.g. {@code EIP})
     * @param account account label (the user's e-mail)
     * @param secret  Base32 secret
     */
    public static String otpauthUri(String issuer, String account, String secret) {
        String encIssuer = urlEncode(issuer);
        return "otpauth://totp/" + encIssuer + ":" + urlEncode(account)
                + "?secret=" + secret
                + "&issuer=" + encIssuer
                + "&algorithm=SHA1&digits=" + DIGITS + "&period=" + PERIOD_SECONDS;
    }

    /** Generates the code of {@code step} for the raw {@code key} (exposed for tests). */
    static String generate(byte[] key, long step) {
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(ByteBuffer.allocate(Long.BYTES).putLong(step).array());
            int offset = hash[hash.length - 1] & 0x0f;
            int binary = ((hash[offset] & 0x7f) << 24)
                    | ((hash[offset + 1] & 0xff) << 16)
                    | ((hash[offset + 2] & 0xff) << 8)
                    | (hash[offset + 3] & 0xff);
            int otp = binary % POW10[DIGITS];
            return String.format(Locale.ROOT, "%0" + DIGITS + "d", otp);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("HmacSHA1 indisponivel", ex);
        }
    }

    /** RFC 4648 Base32 encoding without padding. */
    static String base32Encode(byte[] data) {
        StringBuilder sb = new StringBuilder((data.length * 8 + 4) / 5);
        int buffer = 0;
        int bits = 0;
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xff);
            bits += 8;
            while (bits >= 5) {
                sb.append(BASE32_ALPHABET[(buffer >> (bits - 5)) & 0x1f]);
                bits -= 5;
            }
            buffer &= (1 << bits) - 1;
        }
        if (bits > 0) {
            sb.append(BASE32_ALPHABET[(buffer << (5 - bits)) & 0x1f]);
        }
        return sb.toString();
    }

    /**
     * RFC 4648 Base32 decoding. Case-insensitive; spaces, dashes and padding are ignored.
     *
     * @throws IllegalArgumentException on characters outside the Base32 alphabet
     */
    static byte[] base32Decode(String encoded) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        int buffer = 0;
        int bits = 0;
        for (int i = 0; i < encoded.length(); i++) {
            char c = Character.toUpperCase(encoded.charAt(i));
            if (c == ' ' || c == '-' || c == '=' || Character.isWhitespace(c)) {
                continue;
            }
            int value;
            if (c >= 'A' && c <= 'Z') {
                value = c - 'A';
            } else if (c >= '2' && c <= '7') {
                value = c - '2' + 26;
            } else {
                throw new IllegalArgumentException("Caractere Base32 invalido");
            }
            buffer = (buffer << 5) | value;
            bits += 5;
            if (bits >= 8) {
                out.write((buffer >> (bits - 8)) & 0xff);
                bits -= 8;
                buffer &= (1 << bits) - 1;
            }
        }
        return out.toByteArray();
    }

    private static String urlEncode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
