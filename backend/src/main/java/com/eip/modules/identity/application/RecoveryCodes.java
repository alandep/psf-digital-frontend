package com.eip.modules.identity.application;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Single-use MFA recovery codes ({@code XXXX-XXXX}, unambiguous alphabet).
 * Only {@link #hash(UUID, String)} values are persisted.
 */
public final class RecoveryCodes {

    /** Number of codes issued per generation. */
    public static final int COUNT = 10;

    static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int GROUP = 4;
    private static final SecureRandom RANDOM = new SecureRandom();

    private RecoveryCodes() {
    }

    /** @return {@value #COUNT} distinct fresh codes in display format. */
    public static List<String> generate() {
        Set<String> codes = new LinkedHashSet<>();
        while (codes.size() < COUNT) {
            codes.add(group() + "-" + group());
        }
        return new ArrayList<>(codes);
    }

    /** @return the code upper-cased with every non-alphanumeric character removed. */
    public static String normalize(String code) {
        if (code == null) {
            return "";
        }
        return code.toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]", "");
    }

    /** @return hex SHA-256 of {@code userId + ":" + normalize(code)}. */
    public static String hash(UUID userId, String code) {
        return Digests.sha256Hex(userId + ":" + normalize(code));
    }

    private static String group() {
        StringBuilder sb = new StringBuilder(GROUP);
        for (int i = 0; i < GROUP; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
