package com.eip.modules.logistics.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * A container carried by an {@link Embarque}. Pure value type.
 *
 * @param id     container id, or {@code null} for a not-yet-persisted container
 * @param numero container number (e.g. {@code MSCU1234567})
 * @param tipo   container type (e.g. {@code 40HC})
 * @param tara   tare weight in kilograms
 */
public record Container(UUID id, String numero, String tipo, BigDecimal tara) {
}
