package com.eip.modules.subscription.adapter.out.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link PlanEntity}.
 */
public interface PlanJpaRepository extends JpaRepository<PlanEntity, String> {

    List<PlanEntity> findByActiveTrue();
}
