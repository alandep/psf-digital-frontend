package com.eip.modules.entitlement.adapter.out.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA repository for the global {@link PlanFeatureEntity} catalog. */
public interface PlanFeatureJpaRepository extends JpaRepository<PlanFeatureEntity, PlanFeatureId> {

    List<PlanFeatureEntity> findByPlanCode(String planCode);
}