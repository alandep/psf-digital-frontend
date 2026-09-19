package com.eip.modules.superadmin.domain.model;

/**
 * One stage of the commercial funnel. Pure domain record.
 *
 * @param key               stage key (stable identifier)
 * @param label             human-readable label
 * @param count             number of entities at this stage
 * @param conversionFromPrev conversion percentage from the previous stage,
 *                          {@code null} for the first stage
 */
public record FunnelStage(
        String key,
        String label,
        long count,
        Integer conversionFromPrev) {
}
