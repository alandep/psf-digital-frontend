package com.eip.modules.admin.adapter.out.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/** Admin repository for the global {@link AdminPlanFeatureEntity} catalog. */
public interface AdminPlanFeatureJpaRepository extends JpaRepository<AdminPlanFeatureEntity, AdminPlanFeatureId> {
    List<AdminPlanFeatureEntity> findByPlanCode(String planCode);
}