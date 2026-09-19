package com.eip.modules.bi.domain.model;

import java.util.UUID;

/**
 * Immutable widget belonging to a {@link Dashboard}. Pure domain.
 */
public record Widget(
        UUID id,
        String tipo,
        String titulo,
        String config,
        int ordem) {

    public Widget {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}
