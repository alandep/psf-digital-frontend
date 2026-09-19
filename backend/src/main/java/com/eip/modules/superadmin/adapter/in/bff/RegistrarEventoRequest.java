package com.eip.modules.superadmin.adapter.in.bff;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for recording a product analytics event.
 *
 * @param event      the event name (see {@code ProductEventName})
 * @param properties free-form JSON properties, may be {@code null}
 */
public record RegistrarEventoRequest(
        @NotBlank String event,
        String properties) {
}
