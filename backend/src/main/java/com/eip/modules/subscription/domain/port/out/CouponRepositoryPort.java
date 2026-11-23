package com.eip.modules.subscription.domain.port.out;

import java.util.Optional;

import com.eip.modules.subscription.domain.model.Coupon;

/**
 * Outbound port for the global coupon catalog (no RLS).
 */
public interface CouponRepositoryPort {

    /** Case-insensitive lookup by code. */
    Optional<Coupon> find(String code);

    /**
     * Atomically increments {@code redeemed} when still below {@code max_redemptions}.
     *
     * @return {@code true} when one redemption was consumed
     */
    boolean tryRedeem(String code);
}
