package com.eip.modules.compliance.domain.model;

import java.util.UUID;

/** Strongly-typed identifier of a {@link Certificacao} aggregate. */
public record CertificacaoId(UUID value) {

    public CertificacaoId {
        if (value == null) {
            throw new IllegalArgumentException("CertificacaoId value must not be null");
        }
    }

    public static CertificacaoId of(UUID value) {
        return new CertificacaoId(value);
    }

    public static CertificacaoId of(String value) {
        return new CertificacaoId(UUID.fromString(value));
    }

    public static CertificacaoId novo() {
        return new CertificacaoId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
