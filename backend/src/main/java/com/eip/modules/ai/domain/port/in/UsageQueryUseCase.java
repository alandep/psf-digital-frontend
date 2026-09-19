package com.eip.modules.ai.domain.port.in;

import java.math.BigDecimal;
import java.util.List;

/**
 * Inbound port for read-only AI usage/franquia queries and router inspection,
 * backing the front's AI usage panel.
 */
public interface UsageQueryUseCase {

    /** Reads the AI/OCR franquia meters for the current organization. */
    List<UsageView> currentUsage();

    /** Lists the configured model router entries. */
    List<ModelRouteView> routerConfig();

    /**
     * A single franquia meter as shown to the user.
     *
     * @param percent used/included as a clamped 0..100 percentage
     */
    record UsageView(String feature, String label, BigDecimal used,
            BigDecimal included, String unit, int percent) {
    }

    /** A configured router entry (task/priority -> provider/model). */
    record ModelRouteView(String task, String priority, String provider,
            String model, boolean enabled) {
    }
}
