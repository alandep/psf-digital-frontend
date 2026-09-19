package com.eip.modules.finance.domain.model;

import java.util.UUID;

/** Strongly-typed identifier of a {@link Pagamento} aggregate. */
public record PagamentoId(UUID value) {

    public PagamentoId {
        if (value == null) {
            throw new IllegalArgumentException("PagamentoId value must not be null");
        }
    }

    public static PagamentoId of(UUID value) {
        return new PagamentoId(value);
    }

    public static PagamentoId of(String value) {
        return new PagamentoId(UUID.fromString(value));
    }

    public static PagamentoId novo() {
        return new PagamentoId(UUID.randomUUID());
    }

    public String asString() {
        return value.toString();
    }
}
