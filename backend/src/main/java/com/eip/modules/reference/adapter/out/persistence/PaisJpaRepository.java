package com.eip.modules.reference.adapter.out.persistence;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA repository for {@link PaisEntity}. Global reference data (no tenant scope). */
public interface PaisJpaRepository extends JpaRepository<PaisEntity, String> {

    List<PaisEntity> findAllByOrderByNamePtAsc();
}
