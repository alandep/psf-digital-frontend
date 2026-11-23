package com.eip.modules.subscription.adapter.out.persistence;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link AddonPurchaseEntity}.
 */
public interface AddonPurchaseJpaRepository extends JpaRepository<AddonPurchaseEntity, UUID> {
}
