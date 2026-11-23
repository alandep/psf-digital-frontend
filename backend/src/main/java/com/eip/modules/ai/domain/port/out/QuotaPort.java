package com.eip.modules.ai.domain.port.out;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Outbound port answering "does this org still have AI/OCR franquia?".
 *
 * <p>Implemented by an adapter that delegates to the platform usage-metering
 * service, so the AI module stays decoupled from the Subscription module (no
 * cross-module imports; Modulith verify stays green).
 */
public interface QuotaPort {

    /** All franquia meters for the org (AI, OCR and STORAGE). */
    List<Quota> forOrg(UUID org);

    /**
     * Whether the given feature ({@code AI} or {@code OCR}) still has room in the
     * current cycle. Unknown features are allowed.
     */
    boolean hasRemaining(UUID org, String feature);

    /** A single franquia meter ({@code included == null} means unlimited). */
    record Quota(String feature, String label, BigDecimal used, BigDecimal included, String unit) {
    }
}
