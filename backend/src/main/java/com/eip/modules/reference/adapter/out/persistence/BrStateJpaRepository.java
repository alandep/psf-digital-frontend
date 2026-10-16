package com.eip.modules.reference.adapter.out.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA repository for {@link BrStateEntity}. Global reference data (no tenant scope). */
public interface BrStateJpaRepository extends JpaRepository<BrStateEntity, String> {

    List<BrStateEntity> findAllByOrderByNameAsc();
}
