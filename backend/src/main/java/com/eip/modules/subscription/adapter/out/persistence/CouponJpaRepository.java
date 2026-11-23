package com.eip.modules.subscription.adapter.out.persistence;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA repository for {@link CouponEntity}.
 */
public interface CouponJpaRepository extends JpaRepository<CouponEntity, String> {

    @Query("select c from BillingCoupon c where upper(c.code) = upper(:code)")
    Optional<CouponEntity> findByCodeIgnoreCase(@Param("code") String code);

    /** Atomic conditional increment: only succeeds while below the redemption cap. */
    @Modifying
    @Query("update BillingCoupon c set c.redeemed = c.redeemed + 1 "
            + "where c.code = :code and c.active = true "
            + "and (c.maxRedemptions is null or c.redeemed < c.maxRedemptions)")
    int redeem(@Param("code") String code);
}
