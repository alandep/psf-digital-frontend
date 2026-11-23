package com.eip.modules.subscription.adapter.out.persistence;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.model.Coupon;
import com.eip.modules.subscription.domain.port.out.CouponRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link CouponRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class CouponJpaAdapter implements CouponRepositoryPort {

    private final CouponJpaRepository jpa;

    @Override
    public Optional<Coupon> find(String code) {
        if (code == null || code.isBlank()) {
            return Optional.empty();
        }
        return jpa.findByCodeIgnoreCase(code.trim()).map(e -> new Coupon(e.getCode(),
                e.getDescription(), e.getPlanCode(), e.getBillingInterval(), e.getFixedPrice(),
                e.getCycles(), e.getMaxRedemptions(), e.getRedeemed(), e.getValidUntil(),
                e.isActive()));
    }

    @Override
    public boolean tryRedeem(String code) {
        return jpa.redeem(code) == 1;
    }
}
