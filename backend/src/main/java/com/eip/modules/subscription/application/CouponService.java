package com.eip.modules.subscription.application;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.subscription.application.BillingViews.CouponView;
import com.eip.modules.subscription.domain.model.BillingInterval;
import com.eip.modules.subscription.domain.model.Coupon;
import com.eip.modules.subscription.domain.port.out.CouponRepositoryPort;
import com.eip.platform.error.BusinessRuleException;

import lombok.RequiredArgsConstructor;

/**
 * Coupon validation (rules in {@link Coupon#check}) and atomic redemption.
 */
@Service
@RequiredArgsConstructor
public class CouponService {

    static final String NOT_FOUND = "Cupom não encontrado.";
    static final String EXHAUSTED = "Este cupom atingiu o limite de resgates.";

    private final CouponRepositoryPort coupons;

    /** Public preview of a coupon for a plan/interval. */
    @Transactional(readOnly = true)
    public CouponView validate(String code, String planCode, String interval) {
        String normalized = normalize(code);
        Optional<Coupon> found = coupons.find(normalized);
        if (found.isEmpty()) {
            return new CouponView(false, normalized, null, null, NOT_FOUND);
        }
        Coupon c = found.get();
        Coupon.Check check = c.check(planCode, normalizeInterval(interval), OffsetDateTime.now());
        return new CouponView(check.valid(), c.code(), check.valid() ? c.fixedPrice() : null,
                check.valid() ? c.cycles() : null, check.message());
    }

    /**
     * @return the valid coupon, or {@code null} when {@code code} is blank
     * @throws BusinessRuleException when the coupon does not apply
     */
    public Coupon requireValid(String code, String planCode, BillingInterval interval) {
        if (code == null || code.isBlank()) {
            return null;
        }
        Coupon c = coupons.find(normalize(code))
                .orElseThrow(() -> new BusinessRuleException(NOT_FOUND));
        Coupon.Check check = c.check(planCode, interval.name(), OffsetDateTime.now());
        if (!check.valid()) {
            throw new BusinessRuleException(check.message());
        }
        return c;
    }

    /** Consumes one redemption atomically (UPDATE ... WHERE redeemed &lt; max). */
    public void redeem(Coupon coupon) {
        if (!coupons.tryRedeem(coupon.code())) {
            throw new BusinessRuleException(EXHAUSTED);
        }
    }

    private static String normalize(String code) {
        return code == null ? null : code.trim().toUpperCase(Locale.ROOT);
    }

    private static String normalizeInterval(String interval) {
        if (interval == null || interval.isBlank()) {
            return null;
        }
        String v = interval.trim().toUpperCase(Locale.ROOT);
        return "YEARLY".equals(v) ? "ANNUAL" : v;
    }
}
