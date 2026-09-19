package com.eip.modules.ai.domain.port.out;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Outbound port answering "does this org still have AI/OCR franquia?".
 *
 * <p>Implemented inside the AI module as a read model over the shared
 * {@code subscription_usage} table, so the AI module stays decoupled from the
 * Subscription module (no cross-module imports; Modulith verify stays green).
 */
public interface QuotaPort {

    /** All franquia meters for the org. */
    List<Quota> forOrg(UUID org);

    /** Whether the given feature meter still has room (allow if no meter row). */
    boolean hasRemaining(UUID org, String feature);

    /** A single franquia meter row. */
    record Quota(String feature, BigDecimal used, BigDecimal included) {
    }
}
