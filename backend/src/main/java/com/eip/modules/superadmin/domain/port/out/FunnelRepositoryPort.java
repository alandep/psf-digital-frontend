package com.eip.modules.superadmin.domain.port.out;

import java.util.List;

import com.eip.modules.superadmin.domain.model.FunnelStage;

/**
 * Outbound port: reads the commercial funnel. Implementations count
 * {@code product_event} rows grouped by event, mapped to the canonical funnel
 * ordering. Conversion percentages are computed by the application layer.
 */
public interface FunnelRepositoryPort {

    /**
     * Returns funnel stages in canonical order. {@code conversionFromPrev} may
     * be left {@code null}; the application layer computes it.
     */
    List<FunnelStage> funnel();
}
